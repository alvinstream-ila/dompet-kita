<?php

namespace App\Observers;

use App\Enums\TransactionType;
use App\Models\Asset;
use App\Traits\ClearsFinancialCache;

class AssetObserver
{
    use ClearsFinancialCache;

    /**
     * Handle the Asset "created" event.
     */
    public function created(Asset $asset): void
    {
        $this->syncAssetJournal($asset);

        $this->invalidateFinancialCache($asset->household_id);
    }

    /**
     * Handle the Asset "updated" event.
     */
    public function updated(Asset $asset): void
    {
        // Only sync journal if core investment data changed.
        // Value changes (often from transactions) should NOT trigger journal re-sync
        // to avoid recursion and to keep the "creation expense" stable.
        if ($asset->wasChanged(['name', 'invested_capital', 'type'])) {
            $this->syncAssetJournal($asset);
        }

        $this->invalidateFinancialCache($asset->household_id);
    }

    /**
     * Synchronize the asset journal entry.
     */
    protected function syncAssetJournal(Asset $asset): void
    {
        // When a new asset is added, the initial value is recorded as EXPENSE in the dashboard
        // to reflect that the funds were taken from the dashboard balance (cash) to acquire this asset.
        try {
            $amount = (float) ($asset->invested_capital > 0 ? $asset->invested_capital : $asset->value);

            if ($amount > 0) {
                $asset->syncJournal(
                    'asset_creation',
                    $amount,
                    TransactionType::EXPENSE,
                    'Aset',
                    "Pembelian/pencatatan aset baru: {$asset->name}",
                    $asset->created_at
                );
            } else {
                $asset->removeJournal('asset_creation');
            }
        } catch (\Exception $e) {
            \Log::error("Failed to sync journal for asset [{$asset->id}]: ".$e->getMessage());
        }
    }

    /**
     * Handle the Asset "deleted" event.
     */
    public function deleted(Asset $asset): void
    {
        // Remove the journal entry that was created when this asset was first recorded.
        // Without this, a phantom EXPENSE entry would remain in the user's transaction history.
        $asset->removeJournal('asset_creation');

        $this->invalidateFinancialCache($asset->household_id);
    }
}
