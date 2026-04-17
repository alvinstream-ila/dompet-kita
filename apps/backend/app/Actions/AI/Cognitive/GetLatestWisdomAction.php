<?php

namespace App\Actions\AI\Cognitive;

use App\Models\FinancialWisdom;
use App\Models\User;

class GetLatestWisdomAction
{
    /**
     * Get the latest wisdom for a user.
     */
    public function execute(User $user): ?FinancialWisdom
    {
        return FinancialWisdom::where('user_id', $user->id)
            ->latest()
            ->first();
    }
}
