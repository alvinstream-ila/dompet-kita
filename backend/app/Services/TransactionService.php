<?php

namespace App\Services;

use App\Enums\TransactionType;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class TransactionService
{
    protected BudgetService $budgetService;

    public function __construct(BudgetService $budgetService)
    {
        $this->budgetService = $budgetService;
    }

    /**
     * Get transaction summary data for a given user and period.
     */
    public function getSummary(int $userId, ?int $month, ?int $year, int $budgetCycleStart): array
    {
        $dates = $this->budgetService->getBudgetCycleDates($month, $year, $budgetCycleStart);
        $startDate = $dates['start'];
        $endDate = $dates['end'];

        $summary = Transaction::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->select('type', DB::raw('SUM(amount) as total'))
            ->groupBy('type')
            ->get();

        $income = $summary->firstWhere('type', TransactionType::INCOME)?->total
                  ?? $summary->firstWhere('type', TransactionType::INCOME->value)?->total ?? 0;
        $expense = $summary->firstWhere('type', TransactionType::EXPENSE)?->total
                   ?? $summary->firstWhere('type', TransactionType::EXPENSE->value)?->total ?? 0;

        $recentTransactions = Transaction::where('user_id', $userId)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->limit(10)
            ->get();

        return [
            'income' => (float) $income,
            'expense' => (float) $expense,
            'balance' => (float) ($income - $expense),
            'recentTransactions' => $recentTransactions,
            'period' => [
                'start' => $startDate->toIso8601String(),
                'end' => $endDate->toIso8601String(),
            ],
        ];
    }
}
