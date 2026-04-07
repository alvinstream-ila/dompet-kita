<?php

namespace App\Actions\AI\Cognitive;

use App\Models\FinancialWisdom;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GetUnreadWisdomsAction
{
    /**
     * Get all unread wisdoms for a user.
     *
     * @return Collection<int, FinancialWisdom>
     */
    public function execute(User $user): Collection
    {
        return FinancialWisdom::where('user_id', $user->id)
            ->whereNull('read_at')
            ->latest()
            ->get();
    }
}
