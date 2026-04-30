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
     * Check budget spending for a user.
     *
     * @return array{
     *     spending: float,
     *     limit: float,
     *     percentage: float,
     *     status: string
     * }
     */
    public function execute(string $userName, float $limit): array
    {
        // Search for user by name to scope the spending
        $user = User::where('name', 'like', "%{$userName}%")->first();

        // For now, based on command logic, we sum all expenses
        $query = Transaction::where('type', TransactionType::EXPENSE);

        if ($user instanceof User) {
            $query->where('user_id', $user->id);
        }

        $spending = (float) $query->sum('amount');

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
