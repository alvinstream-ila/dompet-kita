<?php

declare(strict_types=1);

namespace App\Actions\Finance;

use App\Actions\BaseAction;
use App\Models\Goal;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GetSavingsGoalsSummaryAction extends BaseAction
{
    /**
     * Get goals and progress for a user.
     *
     * @return array{
     *     goals: Collection,
     *     overall_progress: float
     * }
     */
    public function execute(?User $user = null): array
    {
        $query = Goal::query();

        if ($user) {
            $query->where('user_id', $user->id);
        }

        $goals = $query->get();

        $totalTarget = (float) $goals->sum('target_amount');
        $totalCurrent = (float) $goals->sum('current_amount');
        $overallProgress = $totalTarget > 0 ? ($totalCurrent / $totalTarget) * 100 : 0;

        return [
            'goals' => $goals,
            'overall_progress' => $overallProgress,
        ];
    }
}
