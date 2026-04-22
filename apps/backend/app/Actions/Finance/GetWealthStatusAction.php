<?php

declare(strict_types=1);

namespace App\Actions\Finance;

use App\Actions\BaseAction;
use App\Models\Asset;
use App\Models\Goal;
use App\Models\Holiday;
use App\Models\Loan;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;

class GetWealthStatusAction extends BaseAction
{
    /**
     * Get comprehensive wealth status for a user.
     *
     * @return array{
     *     month: string,
     *     monthly_summary: array{income: float, expense: float, net: float},
     *     assets_goals: array{net_assets: float, goals: float, total_wealth: float},
     *     obligations: array{debts: float, receivables: float, net_obligations: float}
     * }
     */
    public function execute(?User $user = null): array
    {
        $now = Carbon::now();

        // 1. Transaction Summary
        $txQuery = Transaction::whereMonth('date', $now->month)
            ->whereYear('date', $now->year);

        $txs = $txQuery->get();
        $income = (float) ($txs->where('type', 'income')->sum('amount') ?: 0.0);
        $expense = (float) ($txs->where('type', 'expense')->sum('amount') ?: 0.0);

        // 2. Asset & Goals
        $assetQuery = Asset::query();
        $goalQuery = Goal::query();

        $totalAssets = (float) $assetQuery->sum('value');
        $totalGoals = (float) $goalQuery->sum('current_amount');

        $holidayQuery = Holiday::query();
        $totalHolidayFunds = (float) $holidayQuery->sum('funded_amount');

        // 3. Loans & Debts
        $loanQuery = Loan::query();

        $loans = $loanQuery->get();
        $debts = (float) ($loans->where('type', 'utang')->sum('remaining_amount') ?: 0.0);
        $receivables = (float) ($loans->where('type', 'piutang')->sum('remaining_amount') ?: 0.0);

        return [
            'month' => (string) $now->toFormattedDateString(),
            'monthly_summary' => [
                'income' => $income,
                'expense' => $expense,
                'net' => $income - $expense,
            ],
            'assets_goals' => [
                'net_assets' => $totalAssets,
                'goals' => $totalGoals + $totalHolidayFunds,
                'total_wealth' => $totalAssets + $totalGoals + $totalHolidayFunds,
            ],
            'obligations' => [
                'debts' => $debts,
                'receivables' => $receivables,
                'net_obligations' => $receivables - $debts,
            ],
        ];
    }
}
