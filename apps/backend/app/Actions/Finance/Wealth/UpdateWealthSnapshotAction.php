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
        $total = Asset::where('user_id', $user->id)->sum('value');

        return WealthHistory::updateOrCreate(
            ['user_id' => $user->id, 'month' => $month, 'year' => $year],
            ['total_value' => (float) $total]
        );
    }
}
