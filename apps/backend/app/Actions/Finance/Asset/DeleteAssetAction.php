<?php

declare(strict_types=1);

namespace App\Actions\Finance\Asset;

use App\Actions\BaseAction;
use App\Actions\Finance\Wealth\UpdateWealthSnapshotAction;
use App\Models\Asset;
use App\Models\User;

class DeleteAssetAction extends BaseAction
{
    public function __construct(
        protected UpdateWealthSnapshotAction $updateWealthSnapshotAction
    ) {}

    public function execute(User $user, Asset $asset): ?bool
    {


        $deleted = $asset->delete();

        $this->updateWealthSnapshotAction->execute($user);

        return $deleted;
    }
}
