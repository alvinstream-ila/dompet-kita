<?php

namespace App\Actions\AI\Cognitive;

use App\Models\FinancialWisdom;
use Illuminate\Database\Eloquent\Collection;

class GetUnreadWisdomsAction
{
    /**
     * Get all unread wisdoms for the current household.
     *
     * @return Collection<int, FinancialWisdom>
     */
    public function execute(): Collection
    {
        return FinancialWisdom::whereNull('read_at')
            ->latest()
            ->get();
    }
}
