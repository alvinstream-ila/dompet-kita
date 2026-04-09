<?php

declare(strict_types=1);

namespace App\Actions\Finance;

use App\Actions\BaseAction;
use App\Models\Holiday;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ManageHolidayPlanAction extends BaseAction
{
    /**
     * Create a new holiday plan.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(User $user, array $data): Holiday
    {
        $data['user_id'] = $user->id;
        $data['spent'] = $data['spent'] ?? 0;
        $data['status'] = $data['status'] ?? 'planning';

        return Holiday::create($data);
    }

    /**
     * List all holiday plans.
     *
     * @return Collection<int, Holiday>
     */
    public function list(?User $user = null): Collection
    {
        $query = Holiday::query();
        if ($user) {
            $query->where('user_id', $user->id);
        }

        return $query->get();
    }
}
