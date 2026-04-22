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
        // When a new asset is added, the initial value is recorded as EXPENSE in the dashboard
        // to reflect that the funds were taken from the dashboard balance (cash) to acquire this asset.
        try {
            $amount = (float) ($asset->invested_capital > 0 ? $asset->invested_capital : $asset->value);

            if ($amount > 0) {
                $asset->recordJournal(
                    $amount,
                    TransactionType::EXPENSE,
                    'Aset',
                    "Pembelian/pencatatan aset baru: {$asset->name}"
                );
            }
        } catch (\Exception $e) {
            \Log::error("Failed to record journal for asset [{$asset->id}]: ".$e->getMessage());
        }

        $this->invalidateFinancialCache($asset->user_id);
    }

    /**
     * Handle the Asset "updated" event.
     */
    public function updated(Asset $asset): void
    {
        $this->invalidateFinancialCache($asset->user_id);
    }

    /**
     * Handle the Asset "deleted" event.
     */
    public function deleted(Asset $asset): void
    {
        $this->invalidateFinancialCache($asset->user_id);
    }
}
