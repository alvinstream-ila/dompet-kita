<?php

namespace App\Observers;

use App\Models\Household;
use App\Traits\ClearsFinancialCache;

class HouseholdObserver
{
    use ClearsFinancialCache;

    /**
     * Handle the Household "updated" event.
     */
    public function updated(Household $household): void
    {
        // When household name or other details change, invalidate cache for the whole household scope.
        $this->invalidateFinancialCache($household->id);
    }

    /**
     * Handle the Household "deleted" event.
     */
    public function deleted(Household $household): void
    {
        // Handle cache cleanup for deleted household.
        $this->invalidateFinancialCache($household->id);
    }
}
