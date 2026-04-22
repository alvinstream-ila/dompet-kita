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
     * Note: Expects 0-indexed month (0 = Jan, 11 = Dec) to align with JS/test expectations.
     *
     * @return array{start: Carbon, end: Carbon}
     */
    public function getBudgetCycleDates(?int $monthIndex, ?int $year, int $startDay = 1): array
    {
        $year = $year ?? Carbon::now()->year;
        // Normalize 0-indexed month to 1-indexed Carbon month
        $month = $monthIndex !== null ? $monthIndex + 1 : Carbon::now()->month;

        $start = Carbon::createFromDate($year, $month, $startDay)->startOfDay();
        $end = $start->copy()->addMonth()->subSecond();

        // If startDay is 1, just use simple month boundaries
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

        /** @var array<int, array{id: string, category: string, limit: float, used: float, remaining: float, percentage: float, status: string}> $usage */
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
