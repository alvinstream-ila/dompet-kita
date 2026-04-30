<?php

declare(strict_types=1);

namespace App\Actions\Finance;

use App\Actions\BaseAction;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class GetFinancialReportAction extends BaseAction
{
    /**
     * Get financial report for a specific month.
     *
     * @return array{
     *     month_name: string,
     *     income: float,
     *     expense: float,
     *     net: float,
     *     top_spending: Collection<int, Transaction>
     * }
     */
    public function execute(string $monthStr, ?User $user = null): array
    {
        $month = Carbon::parse($monthStr);

        $query = Transaction::whereMonth('date', $month->month)
            ->whereYear('date', $month->year);

        $txs = $query->get();

        $income = $txs->where('type', TransactionType::INCOME)->sum(fn (Transaction $t): float => (float) $t->amount);
        $expense = $txs->where('type', TransactionType::EXPENSE)->sum(fn (Transaction $t): float => (float) $t->amount);

        $topSpending = $txs->where('type', TransactionType::EXPENSE)
            ->sortByDesc('amount')
            ->take(5);

        return [
            'month_name' => $month->format('F Y'),
            'income' => $income,
            'expense' => $expense,
            'net' => $income - $expense,
            'top_spending' => $topSpending,
        ];
    }
}
