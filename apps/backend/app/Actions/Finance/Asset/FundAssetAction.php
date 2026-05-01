<?php

declare(strict_types=1);

namespace App\Actions\Finance\Asset;

use App\Actions\BaseAction;
use App\Enums\TransactionType;
use App\Models\Asset;
use App\Models\AssetTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class FundAssetAction extends BaseAction
{
    /**
     * Fund an asset, optionally deducting from a source asset.
     *
     * @param  array{amount: float|int, quantity?: float|int, source_asset_id?: string|int|null, description?: string}  $data
     */
    public function execute(User $user, Asset $asset, array $data): Asset
    {
        return DB::transaction(function () use ($user, $asset, $data): Asset {
            $amount = (float) $data['amount'];
            $quantityChange = (float) ($data['quantity'] ?? 0.0);
            $sourceAssetId = $data['source_asset_id'] ?? null;
            $description = $data['description'] ?? 'Top up aset';

            // 1. Create Transaction for the Target Asset
            AssetTransaction::create([
                'user_id' => $user->id,
                'household_id' => $user->household_id,
                'asset_id' => $asset->id,
                'source_asset_id' => $sourceAssetId,
                'amount' => $amount,
                'type' => 'funding',
                'description' => $description,
                'transaction_date' => now(),
            ]);

            // 2. Increment Target Asset Value, Invested Capital, and Quantity
            $asset->increment('value', $amount);
            $asset->increment('invested_capital', $amount);

            if ($quantityChange > 0) {
                $asset->increment('quantity', $quantityChange);
            }

            // 3. Deduct from Source Asset & Journaling
            $journalDescription = "Top up investasi: {$asset->name}";

            if ($sourceAssetId) {
                $sourceAssetQuery = Asset::query();
                if ($user->household_id) {
                    $sourceAssetQuery->where('household_id', $user->household_id);
                } else {
                    $sourceAssetQuery->where('user_id', $user->id);
                }
                $sourceAsset = $sourceAssetQuery->findOrFail($sourceAssetId);

                $journalDescription = "Investasi: {$asset->name} (dari {$sourceAsset->name})";

                // We record a withdrawal for the source asset
                AssetTransaction::create([
                    'user_id' => $user->id,
                    'household_id' => $user->household_id,
                    'asset_id' => $sourceAsset->id,
                    'amount' => $amount,
                    'type' => 'withdrawal',
                    'description' => "Transfer ke {$asset->name}",
                    'transaction_date' => now(),
                ]);

                $sourceAsset->decrement('value', $amount);
                $sourceAsset->decrement('invested_capital', $amount);
            }

            // 4. Ledger recording is now handled by AssetObserver automatically
            // to ensure invested_capital is always synchronized with the Hot Money ledger.
            // Manual recordJournal here would cause double-counting.

            return $asset->fresh() ?? $asset;
        });
    }
}
