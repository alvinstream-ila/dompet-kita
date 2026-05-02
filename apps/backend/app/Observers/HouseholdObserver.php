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
        // When household name or other details change, invalidate cache for all members
        foreach ($household->users as $user) {
            $this->invalidateFinancialCache($user);
        }
    }

    /**
     * Handle the Household "deleted" event.
     */
    public function deleted(Household $household): void
    {
        // Handle cache cleanup for deleted household
        foreach ($household->users as $user) {
            $this->invalidateFinancialCache($user);
        }
    }
}
