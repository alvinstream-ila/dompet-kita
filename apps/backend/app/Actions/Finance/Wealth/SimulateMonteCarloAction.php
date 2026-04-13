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
     *
     * @return array<int, array<string, mixed>>
     */
    public function execute(User $user, int $months = 12): array
    {
        $iterations = 100;
        $forecastBase = $this->forecastWealthAction->execute($user, $months);

        $netWorth = (float) $forecastBase['current_net_worth'];
        $avgSavings = (float) $forecastBase['avg_monthly_savings'];

        $marketContext = (array) $forecastBase['market_context'];
        $inflationRate = (float) $marketContext['inflation_rate'];
        $inflationMonthly = $inflationRate / 12;

        /** @var array<int, array<int, float>> $results -- [month_index][iteration_index] */
        $results = [];

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

                $results[$m][] = (float) max(0, $runningWealth);
            }
        }

        $trajectories = [];
        for ($m = 1; $m <= $months; $m++) {
            $monthData = $results[$m] ?? [];
            if (empty($monthData)) {
                continue;
            }
            sort($monthData);

            $trajectories[] = [
                'month' => (string) Carbon::now()->addMonths($m)->format('M Y'),
                'pessimistic' => (float) $monthData[(int) round($iterations * 0.10) - 1],
                'expected' => (float) $monthData[(int) round($iterations * 0.50) - 1],
                'optimistic' => (float) $monthData[(int) round($iterations * 0.90) - 1],
            ];
        }

        return $trajectories;
    }
}
