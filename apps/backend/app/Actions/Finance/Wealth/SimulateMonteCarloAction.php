<?php

namespace App\Actions\Finance\Wealth;

use App\Actions\BaseAction;
use App\Models\User;
use Carbon\Carbon;

class SimulateMonteCarloAction extends BaseAction
{
    public function __construct(
        protected ForecastWealthAction $forecastWealthAction
    ) {}

    /**
     * [ASP-v3] Probability Engine: Monte Carlo Simulation (100 Iterations).
     * Returns 10th, 50th, and 90th percentile trajectories.
     */
    public function execute(User $user, int $months = 12): array
    {
        $iterations = 100;
        $forecastBase = $this->forecastWealthAction->execute($user, $months);
        $netWorth = $forecastBase['current_net_worth'];
        $avgSavings = $forecastBase['avg_monthly_savings'];
        $inflationMonthly = ($forecastBase['market_context']['inflation_rate'] ?? 0.003) / 12;

        $results = []; // [month_index][iteration_index]

        for ($i = 0; $i < $iterations; $i++) {
            $runningWealth = $netWorth;

            for ($m = 1; $m <= $months; $m++) {
                // 1. Savings volatility: ±25%
                $savingsNoise = (random_int(-25, 25) / 100) * $avgSavings;
                $actualSavings = $avgSavings + $savingsNoise;

                // 2. Market volatility (Paper wealth/Gold logic): ±5%
                $marketNoise = (random_int(-5, 5) / 100);
                $runningWealth = ($runningWealth * (1 + $marketNoise));

                // 3. Regular Savings & Inflation
                $runningWealth = ($runningWealth + $actualSavings) * (1 - $inflationMonthly);

                $results[$m][] = max(0, $runningWealth);
            }
        }

        $trajectories = [];
        for ($m = 1; $m <= $months; $m++) {
            $monthData = $results[$m];
            sort($monthData);

            $trajectories[] = [
                'month' => Carbon::now()->addMonths($m)->format('M Y'),
                'pessimistic' => $monthData[(int) round($iterations * 0.10) - 1],
                'expected' => $monthData[(int) round($iterations * 0.50) - 1],
                'optimistic' => $monthData[(int) round($iterations * 0.90) - 1],
            ];
        }

        return $trajectories;
    }
}
