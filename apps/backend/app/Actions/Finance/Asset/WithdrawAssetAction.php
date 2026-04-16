<?php

namespace App\Actions\Finance\Asset;

use App\Actions\BaseAction;
use App\Models\Asset;
use App\Models\AssetTransaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class WithdrawAssetAction extends BaseAction
{
    /**
     * Withdraw from an asset, optionally moving to a recipient asset.
     *
     * @param  array{amount: float|int, recipient_asset_id?: string|int|null, description?: string}  $data
     */
    public function execute(User $user, Asset $asset, array $data): Asset
    {
        return DB::transaction(function () use ($user, $asset, $data): Asset {
            $amount = (float) $data['amount'];
            $recipientAssetId = $data['recipient_asset_id'] ?? null;
            $description = $data['description'] ?? 'Pencairan aset';

            // 1. Create Transaction for the Source Asset
            AssetTransaction::create([
                'user_id' => $user->id,
                'asset_id' => $asset->id,
                'amount' => $amount,
                'type' => 'withdrawal',
                'description' => $description,
                'transaction_date' => now(),
            ]);

            // 2. Decrement Source Asset Value
            // IMPORTANT: For Capital calculation, we reduce invested_capital proportionally or via Cost Recovery.
            // Simplest: invested_capital = max(0, invested_capital - amount)
            $asset->decrement('value', $amount);

            // Adjust capital. If withdrawing more than capital (profit), capital goes to 0 safely.
            $currentCapital = $asset->invested_capital;
            $capitalReduction = min($currentCapital, $amount);
            $asset->decrement('invested_capital', $capitalReduction);

            // 3. Increment Recipient Asset (if provided)
            if ($recipientAssetId) {
                $recipientAsset = Asset::where('user_id', $user->id)->findOrFail($recipientAssetId);

                // Record a funding for the recipient
                AssetTransaction::create([
                    'user_id' => $user->id,
                    'asset_id' => $recipientAsset->id,
                    'source_asset_id' => $asset->id,
                    'amount' => $amount,
                    'type' => 'funding',
                    'description' => "Pencairan dari {$asset->name}",
                    'transaction_date' => now(),
                ]);

                $recipientAsset->increment('value', $amount);
                $recipientAsset->increment('invested_capital', $amount);
            }

            return $asset->fresh() ?? $asset;
        });
    }
}
