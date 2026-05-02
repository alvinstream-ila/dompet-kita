<?php

namespace App\Observers;

use App\Models\User;
use App\Traits\ClearsFinancialCache;

class UserObserver
{
    use ClearsFinancialCache;

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Invalidate financial cache if budget or threshold settings change
        if ($user->isDirty(['budget_limit', 'budget_threshold', 'currency'])) {
            $this->invalidateFinancialCache($user);
        }
    }
}
