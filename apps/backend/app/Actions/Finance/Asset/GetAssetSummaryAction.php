<?php

declare(strict_types=1);

namespace App\Actions\Finance\Asset;

use App\Actions\BaseAction;
use App\Models\Asset;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class GetAssetSummaryAction extends BaseAction
{
    /**
     * Get asset summary for a user.
     *
     * @return array{
     *     assets: Collection<int, Asset>,
     *     total_wealth: float
     * }
     */
    public function execute(?User $user = null): array
    {
        $query = Asset::query();

        if ($user instanceof User) {
            if ($user->household_id) {
                $query->where('household_id', $user->household_id);
            } else {
                $query->where('user_id', $user->id);
            }
        }

        $assets = $query->get();
        $totalWealth = $assets->sum(fn (Asset $asset): float => (float) $asset->value);

        return [
            'assets' => $assets,
            'total_wealth' => $totalWealth,
        ];
    }
}
