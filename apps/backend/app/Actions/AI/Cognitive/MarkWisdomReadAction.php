<?php

declare(strict_types=1);

namespace App\Actions\AI\Cognitive;

use App\Models\FinancialWisdom;

class MarkWisdomReadAction
{
    /**
     * Mark a wisdom as read.
     */
    public function execute(int $wisdomId): bool
    {
        $wisdom = FinancialWisdom::find($wisdomId);

        if (! $wisdom) {
            return false;
        }

        if (! $wisdom->read_at) {
            $wisdom->update(['read_at' => now()]);
        }

        return true;
    }
}
