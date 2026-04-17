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
     *     goals: Collection<int, Goal>,
     *     overall_progress: float
     * }
     */
    public function execute(?User $user = null): array
    {
        $query = Goal::query();

        if ($user instanceof User) {
            $query->where('user_id', $user->id);
        }

        $goals = $query->get();

        $totalTarget = (float) $goals->sum(fn (Goal $g) => (float) $g->target_amount);
        $totalCurrent = (float) $goals->sum(fn (Goal $g) => (float) $g->current_amount);
        $overallProgress = $totalTarget > 0 ? $totalCurrent / $totalTarget * 100 : 0;

        return [
            'goals' => $goals,
            'overall_progress' => (float) $overallProgress,
        ];
    }
}
