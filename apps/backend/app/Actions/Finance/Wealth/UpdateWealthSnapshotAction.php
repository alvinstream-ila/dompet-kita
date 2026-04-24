<?php

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

        // Aggregate total value of ALL assets in the household
        $total = Asset::where('household_id', $householdId)->sum('value');

        return WealthHistory::updateOrCreate(
            [
                'household_id' => $householdId,
                'month' => $month,
                'year' => $year
            ],
            [
                'total_value' => (float) $total,
                'user_id' => $user->id // Track who performed the latest update
            ]
        );
    }
}
