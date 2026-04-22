<?php

namespace App\Actions\AI\Cognitive;

use App\Models\FinancialWisdom;

class GetLatestWisdomAction
{
    /**
     * Get the latest wisdom for the current household.
     */
    public function execute(): ?FinancialWisdom
    {
        return FinancialWisdom::latest()
            ->first();
    }
}
