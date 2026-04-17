<?php

namespace App\Actions\Finance\Asset;

use App\Actions\BaseAction;
use App\Models\Asset;
use App\Models\AssetTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class FundAssetAction extends BaseAction
{
    /**
     * Fund an asset, optionally deducting from a source asset.
     *
     * @param  array{amount: float|int, source_asset_id?: string|int|null, description?: string}  $data
     */
    public function execute(User $user, Asset $asset, array $data): Asset
    {
        return DB::transaction(function () use ($user, $asset, $data): Asset {
            $amount = (float) $data['amount'];
            $sourceAssetId = $data['source_asset_id'] ?? null;
            $description = $data['description'] ?? 'Top up aset';

            // 1. Create Transaction for the Target Asset
            AssetTransaction::create([
                'user_id' => $user->id,
                'asset_id' => $asset->id,
                'source_asset_id' => $sourceAssetId,
                'amount' => $amount,
                'type' => 'funding',
                'description' => $description,
                'transaction_date' => now(),
            ]);

            // 2. Increment Target Asset Value and Invested Capital
            $asset->increment('value', $amount);
            $asset->increment('invested_capital', $amount);

            // 3. Deduct from Source Asset (if provided)
            if ($sourceAssetId) {
                $sourceAsset = Asset::where('user_id', $user->id)->findOrFail($sourceAssetId);

                // We record a withdrawal for the source asset
                AssetTransaction::create([
                    'user_id' => $user->id,
                    'asset_id' => $sourceAsset->id,
                    'amount' => $amount,
                    'type' => 'withdrawal',
                    'description' => "Transfer ke {$asset->name}",
                    'transaction_date' => now(),
                ]);

                $sourceAsset->decrement('value', $amount);

                // For source asset, if it was a bank/cash being "invested",
                // we treat the deduction as reducing its "value" but usually bank/cash capital is same as value.
                // To keep it simple: we decrement invested_capital too to keep it synced for basic assets.
                $sourceAsset->decrement('invested_capital', $amount);
            }

            return $asset->fresh() ?? $asset;
        });
    }
}
