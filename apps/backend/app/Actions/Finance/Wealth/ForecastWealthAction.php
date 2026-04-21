<?php

namespace App\Actions\Finance\Wealth;

use App\Actions\AI\GetWealthAdviceAction;
use App\Actions\BaseAction;
use App\Models\Asset;
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
        $currentAssets = (float) Asset::where('user_id', $user->id)
            ->sum('value');

        // Zero loans for investment projection focus
        $currentLoans = 0;

        // [ASP-v2] Market Intelligence: Get USD/IDR and Gold Rates dynamically
        $market = (array) $this->marketService->getRates();

        $netWorth = (float) ($currentAssets - $currentLoans);

        // Fixed to 0 per user request: "Focus only on existing asset growth"
        $avgMonthlySavings = 0.0;

        /** @var Collection<int, array{month: string, estimated_net_worth: float|int}> $projection */
        $projection = collect([]);
        $runningWealth = $netWorth > 0 ? $netWorth : 0.0;

        /** @var float $inflationRate */
        $inflationRate = (float) $market['inflation_rate'];
        $inflationMonthly = $inflationRate / 12;

        for ($i = 1; $i <= $months; $i++) {
            // [ASP-v2] Adjusted for Inflation (Using real-time inflation proxy)
            $runningWealth = ($runningWealth + $avgMonthlySavings) * (1 - $inflationMonthly);
            $projection->push([
                'month' => (string) Carbon::now()->addMonths($i)->format('M Y'),
                'estimated_net_worth' => (float) max(0, $runningWealth),
            ]);
        }

        $lastItem = $projection->last();
        $lastWealth = $lastItem ? (float) $lastItem['estimated_net_worth'] : 0.0;

        try {
            $advice = (string) $this->getWealthAdviceAction->execute($user, [
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
