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
    public function execute(User $user): array
    {
        $now = Carbon::now();

        // 1. Transaction Summary (Tenant-Aware)
        $txQuery = Transaction::whereMonth('date', $now->month)
            ->whereYear('date', $now->year);

        if ($user->household_id) {
            $txQuery->where('household_id', $user->household_id);
        } else {
            $txQuery->where('user_id', $user->id);
        }

        $txs = $txQuery->get();
        $income = (float) ($txs->where('type', 'income')->sum('amount') ?: 0.0);
        $expense = (float) ($txs->where('type', 'expense')->sum('amount') ?: 0.0);

        // 2. Asset & Goals (Tenant-Aware)
        $assetQuery = Asset::query();
        $goalQuery = Goal::query();
        $holidayQuery = Holiday::query();
        $loanQuery = Loan::query();

        if ($user->household_id) {
            $assetQuery->where('household_id', $user->household_id);
            $goalQuery->where('household_id', $user->household_id);
            $holidayQuery->where('household_id', $user->household_id);
            $loanQuery->where('household_id', $user->household_id);
        } else {
            $assetQuery->where('user_id', $user->id);
            $goalQuery->where('user_id', $user->id);
            $holidayQuery->where('user_id', $user->id);
            $loanQuery->where('user_id', $user->id);
        }

        $totalAssets = (float) $assetQuery->sum('value');
        $totalGoals = (float) $goalQuery->sum('current_amount');
        $totalHolidayFunds = (float) $holidayQuery->sum('funded_amount');

        // 3. Loans & Debts
        $loans = $loanQuery->get();
        $debts = (float) ($loans->where('type', 'utang')->sum('remaining_amount') ?: 0.0);
        $receivables = (float) ($loans->where('type', 'piutang')->sum('remaining_amount') ?: 0.0);

        return [
            'month' => $now->toFormattedDateString(),
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
