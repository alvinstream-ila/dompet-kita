<?php

namespace App\Actions\Finance\Wealth;

use App\Actions\AI\GetWealthAdviceAction;
use App\Actions\BaseAction;
use App\Enums\TransactionType;
use App\Models\Asset;
use App\Models\Loan;
use App\Models\Transaction;
use App\Models\User;
use App\Services\MarketService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ForecastWealthAction extends BaseAction
{
    public function __construct(
        protected GetWealthAdviceAction $getWealthAdviceAction,
        protected MarketService $marketService
    ) {}

    /**
     * Forecast wealth trajectory for the next 12 months.
     */
    public function execute(User $user, int $months = 12): array
    {
        $currentAssets = Asset::where('user_id', $user->id)->sum('value');
        $currentLoans = Loan::where('user_id', $user->id)->where('status', '!=', 'paid')->sum('remaining_amount');

        // [ASP-v2] Market Intelligence: Get USD/IDR and Gold Rates dynamically
        $market = $this->marketService->getRates();

        $netWorth = $currentAssets - $currentLoans;

        // Calculate average monthly savings (Last 3 months)
        $threeMonthsAgo = Carbon::now()->subMonths(3)->startOfMonth();

        $totalIncome = Transaction::where('user_id', $user->id)
            ->where('type', TransactionType::INCOME)
            ->where('date', '>=', $threeMonthsAgo)
            ->sum('amount');

        $totalExpense = Transaction::where('user_id', $user->id)
            ->where('type', TransactionType::EXPENSE)
            ->where('date', '>=', $threeMonthsAgo)
            ->sum('amount');

        // Prevent division by zero if 3 months is too far back
        $monthCount = Transaction::where('user_id', $user->id)
            ->whereBetween('date', [$threeMonthsAgo, Carbon::now()])
            ->groupBy(DB::raw("TO_CHAR(date, 'YYYY-MM')"))
            ->count() ?: 1;

        $avgMonthlySavings = ($totalIncome - $totalExpense) / $monthCount;

        $projection = [];
        $runningWealth = $netWorth > 0 ? $netWorth : 0;
        $inflationMonthly = $market['inflation_rate'] / 12;

        for ($i = 1; $i <= $months; $i++) {
            // [ASP-v2] Adjusted for Inflation (Using real-time inflation proxy)
            $runningWealth = ($runningWealth + $avgMonthlySavings) * (1 - $inflationMonthly);
            $projection[] = [
                'month' => Carbon::now()->addMonths($i)->format('M Y'),
                'estimated_net_worth' => max(0, $runningWealth),
            ];
        }

        $lastWealth = end($projection)['estimated_net_worth'];

        try {
            $advice = $this->getWealthAdviceAction->execute($user, [
                'netWorth' => $netWorth,
                'savings' => $avgMonthlySavings,
                'projected' => $lastWealth,
            ]);
        } catch (\Exception $e) {
            $advice = 'Sayang, masa depan kita cerah banget kalau kita konsisten nabung. Semangat terus ya! ❤️';
        }

        return [
            'current_net_worth' => $netWorth,
            'avg_monthly_savings' => $avgMonthlySavings,
            'market_context' => $market,
            'projection' => $projection,
            'advice' => $advice,
        ];
    }
}
