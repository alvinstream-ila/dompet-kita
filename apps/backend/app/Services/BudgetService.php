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
        $year ??= (int) $now->year;

        // Determine the target month number
        $targetMonth = $month ?? (int) $now->month;

        // If no month is provided (automatic mode), we check if we are currently
        // before the startDay. If so, the current "active" cycle actually started last month.
        if ($month === null && $startDay > 1 && $now->day < $startDay) {
            $targetMonth--;
        }

        // Handle year wrap-around
        if ($targetMonth <= 0) {
            $targetMonth = 12 + $targetMonth;
            $year--;
        } elseif ($targetMonth > 12) {
            $targetMonth -= 12;
            $year++;
        }

        // 🛡️ Date Integrity: Clamp startDay to the actual last day of the target month.
        // This prevents April 31 from becoming May 1.
        $daysInMonth = (int) Carbon::createFromDate($year, $targetMonth, 1)->daysInMonth;
        $clampedDay = min($startDay, $daysInMonth);

        $start = Carbon::createFromDate($year, $targetMonth, $clampedDay)->startOfDay();
        $end = $start->copy()->addMonthNoOverflow()->subSecond();

        // If startDay is 1, we still want to ensure it's a clean calendar month
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
     * Calculate budget consumption for a specific user/household and period.
     *
     * @return array<int, array{id: string, category: string, limit: float, used: float, remaining: float, percentage: float, status: string}>
     */
    public function getBudgetUsage(\App\Models\User $user, ?int $month = null, ?int $year = null, int $startDay = 1): array
    {
        $dates = $this->getBudgetCycleDates($month, $year, $startDay);

        return Budget::query()->get()->map(function (Budget $budget) use ($dates): array {
            $used = (float) Transaction::where('category', $budget->category)
                ->whereBetween('date', [$dates['start'], $dates['end']])
                ->where('type', \App\Enums\TransactionType::EXPENSE)
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
                'percentage' => round($percentage, 2),
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
