<?php

namespace App\Actions\Finance\Wealth;

use App\Actions\BaseAction;
use App\Models\Goal;
use App\Models\User;
use Illuminate\Support\Collection;

class SimulatePurchaseAction extends BaseAction
{
    public function __construct(
        protected ForecastWealthAction $forecastWealthAction
    ) {}

    /**
     * [ASP-v2] What-If Simulation: Calculate impact of big purchases on goals.
     *
     * @return array<string, mixed>
     */
    public function execute(User $user, float $amount, string $reason): array
    {
        $forecast = $this->forecastWealthAction->execute($user, 12);
        /** @var Collection<int, array{month: string, estimated_net_worth: float|int}> $projection */
        $projection = $forecast['projection'];
        $lastItem = $projection->last();
        $originalFinalWealth = $lastItem ? (float) $lastItem['estimated_net_worth'] : 1.0;

        $goals = Goal::where('user_id', $user->id)->get();

        return [
            'purchase_amount' => $amount,
            'reason' => $reason,
            'wealth_delta' => -$amount,
            'impact_summary' => 'Pembelian ini akan mengurangi total kekayaan akhir tahun kita sebesar '.number_format($amount / max(1, $originalFinalWealth) * 100, 2).'%.',
            'goal_delay_risk' => count($goals) > 0 && $goals->first() ? 'Risiko tinggi delay pada target: '.$goals->first()->name : 'Aman, belum ada target kritis terdekat.',
        ];
    }
}
