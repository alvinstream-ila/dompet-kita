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
     *     recentTransactions: Collection<int, Transaction>,
     *     period: array{start: string, end: string}
     * }
     */
    public function execute(int $userId, ?int $month, ?int $year, int $budgetCycleStart): array
    {
        $cacheKey = "transaction_summary_{$userId}_".($month ?? 'all').'_'.($year ?? 'all')."_{$budgetCycleStart}";

        return Cache::remember($cacheKey, 3600, function () use ($userId, $month, $year, $budgetCycleStart) {
            $dates = $this->budgetService->getBudgetCycleDates($month, $year, $budgetCycleStart);
            $startDate = $dates['start'];
            $endDate = $dates['end'];

            $summary = Transaction::where('user_id', $userId)
                ->whereBetween('date', [$startDate, $endDate])
                ->select('type', DB::raw('SUM(amount) as total'))
                ->groupBy('type')
                ->get();

            $income = (float) ($summary->firstWhere('type', TransactionType::INCOME)?->total
                      ?? $summary->firstWhere('type', TransactionType::INCOME->value)?->total ?? 0);
            $expense = (float) ($summary->firstWhere('type', TransactionType::EXPENSE)?->total
                       ?? $summary->firstWhere('type', TransactionType::EXPENSE->value)?->total ?? 0);

            $recentTransactions = Transaction::where('user_id', $userId)
                ->whereBetween('date', [$startDate, $endDate])
                ->orderBy('date', 'desc')
                ->limit(5)
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
        });
    }
}
