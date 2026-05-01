<?php

declare(strict_types=1);

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
use Illuminate\Support\Collection;

class ForecastWealthAction extends BaseAction
{
    public function __construct(
        protected GetWealthAdviceAction $getWealthAdviceAction,
        protected MarketService $marketService
    ) {}

    /**
     * Forecast wealth trajectory for the next 12 months.
     *
     * @return array{
     *     current_net_worth: float|int,
     *     avg_monthly_savings: float|int,
     *     market_context: array{
     *         inflation_rate: float,
     *         gold_antam_gram: float,
     *         gold_global_oz: float,
     *         currency_rates: array<string, float>,
     *         last_updated: string
     *     },
     *     projection: Collection<int, array{month: string, estimated_net_worth: float|int}>,
     *     advice: string
     * }
     */
    public function execute(User $user, int $months = 12): array
    {
        $householdId = $user->household_id;

        // 1. Assets
        $assetQuery = Asset::query();
        if ($householdId) {
            $assetQuery->where('household_id', $householdId);
        } else {
            $assetQuery->where('user_id', $user->id);
        }
        $currentAssets = (float) $assetQuery->sum('value');

        // 2. Loans (Fix: No longer hardcoded to 0)
        $loanQuery = Loan::query();
        if ($householdId) {
            $loanQuery->where('household_id', $householdId);
        } else {
            $loanQuery->where('user_id', $user->id);
        }
        $currentLoans = (float) $loanQuery->where('status', '!=', 'paid')->sum('amount');

        // 3. Savings (Fix: Calculate historical avg monthly savings)
        $avgMonthlySavings = $this->calculateAvgMonthlySavings($user);

        // 4. Market Context
        $market = $this->marketService->getRates();
        $netWorth = $currentAssets - $currentLoans;

        /** @var Collection<int, array{month: string, estimated_net_worth: float|int}> $projection */
        $projection = collect([]);
        $runningWealth = $netWorth > 0 ? $netWorth : 0.0;

        // Projections
        // We assume a conservative asset growth rate that roughly offsets inflation + 2%
        // to show "Nominal" value growth, which is more intuitive for users.
        $annualGrowth = 0.055; // 5.5% annual growth (typical conservative portfolio)
        $monthlyGrowth = $annualGrowth / 12;

        for ($i = 1; $i <= $months; $i++) {
            // Formula: (Current + Savings) * (1 + Growth)
            $runningWealth = ($runningWealth + $avgMonthlySavings) * (1 + $monthlyGrowth);

            $projection->push([
                'month' => (string) Carbon::now()->addMonths($i)->format('M Y'),
                'estimated_net_worth' => (float) max(0, $runningWealth),
            ]);
        }

        $lastItem = $projection->last();
        $lastWealth = $lastItem ? (float) $lastItem['estimated_net_worth'] : 0.0;

        try {
            $advice = $this->getWealthAdviceAction->execute($user, [
                'netWorth' => $netWorth,
                'savings' => $avgMonthlySavings,
                'projected' => $lastWealth,
            ]);
        } catch (\Exception) {
            $advice = 'Proyeksi finansial menunjukkan tren positif. Konsistensi dalam akumulasi aset akan mempercepat pencapaian target kemandirian finansial Anda.';
        }

        return [
            'current_net_worth' => $netWorth,
            'avg_monthly_savings' => $avgMonthlySavings,
            'market_context' => $market,
            'projection' => $projection,
            'advice' => $advice,
        ];
    }

    /**
     * Calculate average monthly savings over the last 6 months.
     */
    private function calculateAvgMonthlySavings(User $user): float
    {
        $sixMonthsAgo = Carbon::now()->subMonths(6)->startOfMonth();

        $query = Transaction::query()
            ->where('date', '>=', $sixMonthsAgo);

        if ($user->household_id) {
            $query->where('household_id', $user->household_id);
        } else {
            $query->where('user_id', $user->id);
        }

        $totals = $query->toBase()->selectRaw('
                SUM(CASE WHEN type = ? THEN amount ELSE 0 END) as income,
                SUM(CASE WHEN type = ? THEN amount ELSE 0 END) as expense
            ', [TransactionType::INCOME->value, TransactionType::EXPENSE->value])
            ->first();

        if (! $totals) {
            return 0.0;
        }

        $totalSavings = (float) ($totals->income ?? 0) - (float) ($totals->expense ?? 0);

        return (float) max(0, $totalSavings / 6);
    }
}
