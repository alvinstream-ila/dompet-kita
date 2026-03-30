<?php

namespace App\Services;

use Carbon\Carbon;

class BudgetService
{
    /**
     * Calculate start and end dates based on budget cycle.
     * Expects 0-indexed month from frontend or defaults to current.
     *
     * @param  int|null  $month  0-indexed month (0-11)
     * @return array<string, Carbon> ['start' => Carbon, 'end' => Carbon]
     */
    public function getBudgetCycleDates(?int $month, ?int $year, int $budgetCycleStart = 1): array
    {
        // Frontend uses 0-indexed months (0-11), PHP Carbon uses 1-indexed (1-12)
        $monthIsValid = ($month !== null && $month >= 0 && $month <= 11);
        $targetMonth = $monthIsValid ? $month + 1 : now()->month;

        $yearIsValid = ($year !== null && $year > 1900 && $year < 2100);
        $targetYear = $yearIsValid ? $year : now()->year;

        // Anchor in the middle of current target month to avoid edge-case shifts
        $anchorDate = Carbon::create($targetYear, $targetMonth, 15);

        if ($budgetCycleStart === 1) {
            $startDate = $anchorDate->copy()->startOfMonth();
            $endDate = $anchorDate->copy()->endOfMonth();
        } else {
            // Cycle e.g. 25-24: End is current month 24th, Start is previous month 25th
            $endDate = Carbon::create($targetYear, $targetMonth, $budgetCycleStart - 1)->endOfDay();
            $startDate = $endDate->copy()->subMonth()->addDay()->startOfDay();
        }

        return [
            'start' => $startDate,
            'end' => $endDate,
        ];
    }
}
