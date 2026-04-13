<?php

namespace App\Actions\Finance\Wealth;

use App\Actions\AI\GetWealthAdviceAction;
use App\Actions\BaseAction;
use App\Enums\AssetType;
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
     *     market_context: array<string, mixed>,
     *     projection: Collection<int, array{month: string, estimated_net_worth: float|int}>,
     *     advice: string
     * }
     */
    public function execute(User $user, int $months = 12): array
    {
        $currentAssets = Asset::where('user_id', $user->id)
            ->where('type', AssetType::INVESTMENT)
            ->sum('value');

        // Zero loans for investment projection focus
        $currentLoans = 0;

        // [ASP-v2] Market Intelligence: Get USD/IDR and Gold Rates dynamically
        $market = $this->marketService->getRates();

        $netWorth = $currentAssets - $currentLoans;

        // Fixed to 0 per user request: "Focus only on existing asset growth"
        $avgMonthlySavings = 0;

        /** @var Collection<int, array<string, mixed>> $projection */
        $projection = collect([]);
        $runningWealth = $netWorth > 0 ? $netWorth : 0;
        /** @var float $inflationRate */
        $inflationRate = $market['inflation_rate'];
        $inflationMonthly = $inflationRate / 12;

        for ($i = 1; $i <= $months; $i++) {
            // [ASP-v2] Adjusted for Inflation (Using real-time inflation proxy)
            $runningWealth = ($runningWealth + $avgMonthlySavings) * (1 - $inflationMonthly);
            $projection->push([
                'month' => Carbon::now()->addMonths($i)->format('M Y'),
                'estimated_net_worth' => max(0, $runningWealth),
            ]);
        }

        $lastItem = $projection->last();
        $lastWealth = $lastItem ? $lastItem['estimated_net_worth'] : 0;

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
