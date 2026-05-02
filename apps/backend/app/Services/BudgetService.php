<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\Budget;
use App\Models\Transaction;
use App\Models\User;
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

        // Use a Carbon instance to handle arithmetic safely across year boundaries
        $targetDate = Carbon::createFromDate(
            $year ?? (int) $now->year,
            $month ?? (int) $now->month,
            1
        );

        // If no month is provided (automatic mode), we check if we are currently
        // before the startDay. If so, the current "active" cycle actually started last month.
        if ($month === null && $startDay > 1 && $now->day < $startDay) {
            $targetDate->subMonth();
        }

        $year = (int) $targetDate->year;
        $targetMonth = (int) $targetDate->month;

        // 🛡️ Date Integrity: Determine the actual start date for the target cycle.
        $daysInTargetMonth = (int) Carbon::createFromDate($year, $targetMonth, 1)->daysInMonth;
        $actualStartDay = min($startDay, $daysInTargetMonth);
        $start = Carbon::createFromDate($year, $targetMonth, $actualStartDay)->startOfDay();

        // 🛡️ Fix 61/84: To prevent "lost days", the end of the cycle is the second before
        // the start of the NEXT cycle.
        $nextMonth = $targetMonth + 1;
        $nextYear = $year;
        if ($nextMonth > 12) {
            $nextMonth = 1;
            $nextYear++;
        }

        $daysInNextMonth = (int) Carbon::createFromDate($nextYear, $nextMonth, 1)->daysInMonth;
        $actualNextStartDay = min($actualStartDay, $daysInNextMonth);
        $nextStart = Carbon::createFromDate($nextYear, $nextMonth, $actualNextStartDay)->startOfDay();

        $end = $nextStart->copy()->subSecond();

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
    public function getBudgetUsage(?int $month = null, ?int $year = null, int $startDay = 1): array
    {
        $dates = $this->getBudgetCycleDates($month, $year, $startDay);

        // 🚀 Optimization: Single query to fetch all category sums in the period (N+1 fix)
        $usage = Transaction::query()
            ->whereBetween('date', [$dates['start'], $dates['end']])
            ->where('type', TransactionType::EXPENSE)
            ->selectRaw('category, SUM(amount) as total')
            ->groupBy('category')
            ->pluck('total', 'category');

        return Budget::query()->get()->map(function (Budget $budget) use ($usage): array {
            $used = (float) ($usage[$budget->category] ?? 0);

            $limit = (float) $budget->limit;
            $remaining = max(0.0, $limit - $used);
            $percentage = $limit > 0 ? ($used / $limit) * 100 : 0;

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
