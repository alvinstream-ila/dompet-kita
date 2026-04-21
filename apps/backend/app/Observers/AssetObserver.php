<?php

namespace App\Observers;

use App\Enums\TransactionType;
use App\Models\Asset;

class AssetObserver
{
    /**
     * Handle the Asset "created" event.
     */
    public function created(Asset $asset): void
    {
        // When a new asset is added, the initial value is recorded as INCOME in the dashboard
        // to acknowledge the presence of this "New Money" in the system's awareness.
        try {
            $asset->recordJournal(
                (float) ($asset->invested_capital > 0 ? $asset->invested_capital : $asset->value),
                TransactionType::INCOME,
                'Aset',
                "Pencatatan aset baru: {$asset->name}"
            );
        } catch (\Exception $e) {
            \Log::error("Failed to record journal for asset [{$asset->id}]: ".$e->getMessage());
        }
    }
}
