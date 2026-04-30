<?php

declare(strict_types=1);

namespace App\Actions\System;

use App\Actions\BaseAction;
use App\Enums\TransactionType;
use App\Models\Asset;
use App\Models\Goal;
use App\Models\Loan;
use App\Models\Transaction;
use App\Models\User;
use App\Services\FinancialIntelligenceService;
use Spatie\Activitylog\Models\Activity;

class GetSystemStatusAction extends BaseAction
{
    public function __construct(private readonly FinancialIntelligenceService $intel) {}

    /**
     * Get system status overview.
     *
     * @return array{
     *     active_balance: float,
     *     total_assets: float,
     *     active_loans: float,
     *     net_worth: float,
     *     security_alerts: int,
     *     market: array{usd_idr: float, gold_gram: float},
     *     top_targets: array<int, array{name: string, percentage: float, status_icon: string}>
     * }
     */
    public function execute(?User $user = null): array
    {
        // 1. Balance Summary
        $txQuery = Transaction::query();

        $income = (float) $txQuery->clone()->where('type', TransactionType::INCOME)->sum('amount');
        $expense = (float) $txQuery->clone()->where('type', TransactionType::EXPENSE)->sum('amount');
        $balance = $income - $expense;

        // 2. Assets & Loans
        $assetQuery = Asset::query();
        $loanQuery = Loan::query();

        $assets = (float) $assetQuery->sum('value');
        $loans = (float) $loanQuery->where('status', '!=', 'paid')->sum('amount');

        // 3. Security
        $alerts = Activity::where('log_name', 'sentinel')
            ->where('created_at', '>=', now()->subDays(7))
            ->count();

        // 4. Market Pulse
        $marketData = $this->intel->getCurrentMarketContext();

        // 5. Targets
        $goalsQuery = Goal::where('status', 'active')->orderBy('target_amount', 'desc')->take(2);

        /** @var array<int, array{name: string, percentage: float, status_icon: string}> $targets */
        $targets = $goalsQuery->get()->map(function ($goal): array {
            $percent = $goal->target_amount > 0 ? (float) $goal->current_amount / (float) $goal->target_amount * 100 : 0;

            if ($percent >= 100) {
                $statusIcon = '✅';
            } elseif ($percent >= 50) {
                $statusIcon = '🔥';
            } else {
                $statusIcon = '⏳';
            }

            return [
                'name' => (string) $goal->name,
                'percentage' => (float) $percent,
                'status_icon' => $statusIcon,
            ];
        })->toArray();

        return [
            'active_balance' => $balance,
            'total_assets' => $assets,
            'active_loans' => $loans,
            'net_worth' => $assets - $loans,
            'security_alerts' => $alerts,
            'market' => [
                'usd_idr' => (float) $marketData['usd_idr'],
                'gold_gram' => (float) $marketData['gold_gram'],
            ],
            'top_targets' => $targets,
        ];
    }
}
