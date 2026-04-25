<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Transaction;
use Illuminate\Support\Carbon;

/**
 * BudgetService: Logic for monthly budget cycle and calculation.
 */
class BudgetService
{
    /**
     * Get start and end date for current budget cycle.
     *
     * @return array{start: Carbon, end: Carbon}
     */
    public function getCurrentCycleDates(): array
    {
        $now = Carbon::now();

        return [
            'start' => $now->copy()->startOfMonth(),
            'end' => $now->copy()->endOfMonth(),
        ];
    }

    /**
     * Get period boundaries for a specific month and year.
     * Note: Expects 1-indexed month (1 = Jan, 12 = Dec) to align with standard API practices.
     *
     * @return array{start: Carbon, end: Carbon}
     */
    public function getBudgetCycleDates(?int $month = null, ?int $year = null, int $startDay = 1): array
    {
        $now = Carbon::now();
        $year = $year ?? $now->year;

        // Determine the target month number
        $targetMonth = $month ?? $now->month;

        // If the cycle starts after the 1st (e.g., 25th), the cycle for "Month X"
        // actually started in "Month X-1".
        // Example: April cycle starts March 25 and ends April 24.
        if ($startDay > 1) {
            // If month was explicitly provided, we always shift back.
            // If not provided (current cycle), we shift back only if we haven't reached the startDay yet.
            if ($month !== null || $now->day < $startDay) {
                $targetMonth--;
            }
        }

        // Handle year wrap-around
        if ($targetMonth <= 0) {
            $targetMonth = 12 + $targetMonth;
            $year--;
        } elseif ($targetMonth > 12) {
            $targetMonth = $targetMonth - 12;
            $year++;
        }

        $start = Carbon::createFromDate($year, $targetMonth, $startDay)->startOfDay();
        $end = $start->copy()->addMonth()->subSecond();

        // If startDay is 1, we still want to ensure it's a clean calendar month
        // (though createFromDate with 1 and addMonth usually does this anyway)
        if ($startDay === 1) {
            return [
                'start' => $start->copy()->startOfMonth(),
                'end' => $start->copy()->endOfMonth(),
            ];
        }

        return [
            'start' => $start,
            'end' => $end,
        ];
    }

    /**
     * Calculate budget consumption for a specific user.
     *
     * @return array<int, array{id: string, category: string, limit: float, used: float, remaining: float, percentage: float, status: string}>
     */
    public function getBudgetUsage(): array
    {
        $cycle = $this->getCurrentCycleDates();
        $budgets = Budget::get();

        return $budgets->map(function (Budget $budget) use ($cycle) {
            $used = (float) Transaction::where('category', $budget->category)
                ->whereBetween('date', [$cycle['start'], $cycle['end']])
                ->where('type', 'expense')
                ->sum('amount');

            $limit = (float) $budget->limit;
            $remaining = max(0, $limit - $used);
            $percentage = $limit > 0 ? $used / $limit * 100 : 0;

            return [
                'id' => (string) $budget->id,
                'category' => (string) $budget->category,
                'limit' => $limit,
                'used' => $used,
                'remaining' => $remaining,
                'percentage' => (float) round($percentage, 2),
                'status' => $this->getUsageStatus((float) $percentage),
            ];
        })->all();
    }

    /**
     * Get localized status string for budget usage percentage.
     */
    private function getUsageStatus(float $percentage): string
    {
        return match (true) {
            $percentage >= 100 => 'OVER_BUDGET',
            $percentage >= 80 => 'WARNING',
            $percentage >= 50 => 'CAUTION',
            default => 'SAFE',
        };
    }
}
