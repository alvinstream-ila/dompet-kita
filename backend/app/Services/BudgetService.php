<?php

namespace App\Services;

use Carbon\Carbon;

class BudgetService
{
    /**
     * Calculate start and end dates based on budget cycle.
     * Expects 0-indexed month from frontend or defaults to current.
     * 
     * @param int|null $month 0-indexed month (0-11)
     * @param int|null $year
     * @param int $budgetCycleStart
     * @return array ['start' => Carbon, 'end' => Carbon]
     */
    public function getBudgetCycleDates(?int $month, ?int $year, int $budgetCycleStart = 1): array
    {
        $computedMonth = (int) ($month !== null && $month >= 0 && $month <= 11 ? $month : now()->month - 1) + 1;
        $computedYear = (int) ($year !== null && $year > 1900 && $year < 2100 ? $year : now()->year);

        $currentMonthDate = Carbon::create($computedYear, $computedMonth, 15);

        if ($budgetCycleStart === 1) {
            $startDate = $currentMonthDate->copy()->startOfMonth();
            $endDate = $currentMonthDate->copy()->endOfMonth();
        } else {
            $endDate = Carbon::create($computedYear, $computedMonth, $budgetCycleStart - 1)->endOfDay();
            $startDate = $endDate->copy()->subMonth()->addDay()->startOfDay();
        }

        return [
            'start' => $startDate,
            'end' => $endDate
        ];
    }
}
