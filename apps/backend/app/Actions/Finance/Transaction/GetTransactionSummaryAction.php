<?php

namespace App\Actions\Finance\Transaction;

use App\Actions\BaseAction;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Services\BudgetService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class GetTransactionSummaryAction extends BaseAction
{
    public function __construct(protected BudgetService $budgetService) {}

    /**
     * @return array{
     *     income: float,
     *     expense: float,
     *     balance: float,
     *     cumulative_balance: float,
     *     calendar_income: float,
     *     calendar_expense: float,
     *     recentTransactions: Collection<int, Transaction>,
     *     category_breakdown: array<int, array{type: string, category: string, amount: float}>,
     *     period: array{start: string, end: string}
     * }
     */
    public function execute(int $userId, ?int $month, ?int $year, int $budgetCycleStart): array
    {
        $version = (int) Cache::get("transaction_summary_version_{$userId}", 1);
        $cacheKey = "transaction_summary_{$userId}_".($month ?? 'all').'_'.($year ?? 'all')."_{$budgetCycleStart}_v{$version}";

        return Cache::remember($cacheKey, 600, function () use ($month, $year, $budgetCycleStart) {
            $selectSum = DB::raw('SUM(amount) as total');

            // Helper to extract amount from summary collection
            $extractAmount = function (\Illuminate\Support\Collection $collection, TransactionType $type): float {
                /** @var Transaction|null $model */
                $model = $collection->firstWhere('type', $type) ?? $collection->firstWhere('type', $type->value);

                return $model ? (float) $model->total : 0.0;
            };

            // 1. Budget Cycle Dates (Tied to salary/gajian date)
            $dates = $this->budgetService->getBudgetCycleDates($month, $year, $budgetCycleStart);
            $startDate = $dates['start'];
            $endDate = $dates['end'];

            $summary = Transaction::query()
                ->whereBetween('date', [$startDate, $endDate])
                ->select('type', $selectSum)
                ->groupBy('type')
                ->get();

            $income = $extractAmount($summary, TransactionType::INCOME);
            $expense = $extractAmount($summary, TransactionType::EXPENSE);

            // 2. Calendar Month Dates (Strict 1st to end-of-month for general monitoring)
            $calendarDates = $this->budgetService->getBudgetCycleDates($month, $year, 1);
            $calendarSummary = Transaction::query()
                ->whereBetween('date', [$calendarDates['start'], $calendarDates['end']])
                ->select('type', $selectSum)
                ->groupBy('type')
                ->get();

            $calIncome = $extractAmount($calendarSummary, TransactionType::INCOME);
            $calExpense = $extractAmount($calendarSummary, TransactionType::EXPENSE);

            // 3. Cumulative Balance (All-time Net Worth calculation)
            $cumulativeSummary = Transaction::query()
                ->select('type', $selectSum)
                ->groupBy('type')
                ->get();

            $totalIncome = $extractAmount($cumulativeSummary, TransactionType::INCOME);
            $totalExpense = $extractAmount($cumulativeSummary, TransactionType::EXPENSE);

            $recentTransactions = Transaction::query()
                ->whereBetween('date', [$startDate, $endDate])
                ->orderBy('date', 'desc')
                ->limit(5)
                ->get();

            $categoryBreakdown = Transaction::query()
                ->whereBetween('date', [$startDate, $endDate])
                ->select('type', 'category', $selectSum)
                ->groupBy('type', 'category')
                ->get()
                ->map(fn ($item) => [
                    'type' => $item->type->value,
                    'category' => $item->category,
                    'amount' => (float) $item->total,
                ]);

            return [
                'income' => $income,
                'expense' => $expense,
                'balance' => $income - $expense,
                'cumulative_balance' => $totalIncome - $totalExpense,
                'calendar_income' => $calIncome,
                'calendar_expense' => $calExpense,
                'recentTransactions' => $recentTransactions,
                'category_breakdown' => $categoryBreakdown->all(),
                'period' => [
                    'start' => $startDate->toIso8601String(),
                    'end' => $endDate->toIso8601String(),
                ],
            ];
        });
    }
}
