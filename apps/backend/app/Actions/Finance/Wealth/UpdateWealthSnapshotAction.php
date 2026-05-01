<?php

declare(strict_types=1);

namespace App\Actions\Finance\Wealth;

use App\Actions\BaseAction;
use App\Models\Asset;
use App\Models\User;
use App\Models\WealthHistory;

class UpdateWealthSnapshotAction extends BaseAction
{
    public function execute(User $user): WealthHistory
    {
        $month = \now()->month;
        $year = \now()->year;
        $householdId = $user->household_id;

        // Aggregate total value of ALL assets in the household (or user if no household yet)
        $query = Asset::query();
        if ($householdId) {
            $query->where('household_id', $householdId);
        } else {
            $query->where('user_id', $user->id);
        }

        $total = $query->sum('value');

        return WealthHistory::updateOrCreate(
            [
                'household_id' => $householdId,
                'month' => $month,
                'year' => $year,
            ],
            [
                'total_value' => (float) $total,
                'user_id' => $user->id, // Track who performed the latest update
            ]
        );
    }
}
