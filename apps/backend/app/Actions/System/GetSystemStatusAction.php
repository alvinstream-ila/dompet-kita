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
use Illuminate\Support\Facades\Auth;
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
        $user ??= Auth::user();

        if (! $user instanceof User) {
            return [
                'active_balance' => 0.0,
                'total_assets' => 0.0,
                'active_loans' => 0.0,
                'net_worth' => 0.0,
                'security_alerts' => 0,
                'market' => ['usd_idr' => 0.0, 'gold_gram' => 0.0],
                'top_targets' => [],
            ];
        }

        $householdId = $user->household_id;

        // 1. Balance Summary
        $txQuery = Transaction::query();
        if ($householdId) {
            $txQuery->where('household_id', $householdId);
        } else {
            $txQuery->where('user_id', $user->id);
        }

        $income = (float) $txQuery->clone()->where('type', TransactionType::INCOME)->sum('amount');
        $expense = (float) $txQuery->clone()->where('type', TransactionType::EXPENSE)->sum('amount');
        $balance = $income - $expense;

        // 2. Assets & Loans
        $assetQuery = Asset::query();
        $loanQuery = Loan::query();

        if ($householdId) {
            $assetQuery->where('household_id', $householdId);
            $loanQuery->where('household_id', $householdId);
        } else {
            $assetQuery->where('user_id', $user->id);
            $loanQuery->where('user_id', $user->id);
        }

        $assets = (float) $assetQuery->sum('value');
        $loans = (float) $loanQuery->where('status', '!=', 'paid')->sum('amount');

        // 3. Security
        $alertsQuery = Activity::where('log_name', 'sentinel')
            ->where('created_at', '>=', now()->subDays(7));

        if ($householdId) {
            $memberIds = User::where('household_id', $householdId)->pluck('id');
            $alertsQuery->where(function ($q) use ($memberIds, $householdId) {
                $q->whereIn('causer_id', $memberIds)
                    ->orWhere('properties->household_id', $householdId);
            });
        } else {
            $alertsQuery->where('causer_id', $user->id);
        }

        $alerts = $alertsQuery->count();

        // 4. Market Pulse
        $marketData = $this->intel->getCurrentMarketContext();

        // 5. Targets
        $goalsQuery = Goal::where('status', 'active');

        if ($householdId) {
            $goalsQuery->where('household_id', $householdId);
        } else {
            $goalsQuery->where('user_id', $user->id);
        }

        $goalsQuery->orderBy('target_amount', 'desc')->take(2);

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
