<?php

declare(strict_types=1);

namespace App\Actions\Finance;

use App\Actions\BaseAction;
use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Models\User;

class CheckBudgetLimitsAction extends BaseAction
{
    /**
     * Check current-month budget spending for a user.
     *
     * @return array{
     *     spending: float,
     *     limit: float,
     *     percentage: float,
     *     status: string
     * }
     */
    public function execute(User $user, float $limit): array
    {
        // Scope to current calendar month to make the check meaningful.
        // Summing all-time expenses against a monthly limit would always be over-budget.
        $query = Transaction::query();
        if ($user->household_id) {
            $query->where('household_id', $user->household_id);
        } else {
            $query->where('user_id', $user->id);
        }

        $spending = (float) $query->where('type', TransactionType::EXPENSE)
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->sum('amount');

        $percentage = $limit > 0 ? $spending / $limit * 100 : 0;

        $status = 'safe';
        if ($percentage >= 100) {
            $status = 'critical';
        } elseif ($percentage >= 90) {
            $status = 'warning';
        }

        return [
            'spending' => $spending,
            'limit' => $limit,
            'percentage' => (float) $percentage,
            'status' => (string) $status,
        ];
    }
}
