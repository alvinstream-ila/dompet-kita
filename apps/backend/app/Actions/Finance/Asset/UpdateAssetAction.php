<?php

namespace App\Actions\Finance\Asset;

use App\Actions\BaseAction;
use App\Actions\Finance\Wealth\UpdateWealthSnapshotAction;
use App\Models\Asset;
use App\Models\User;

class UpdateAssetAction extends BaseAction
{
    public function __construct(
        protected UpdateWealthSnapshotAction $updateWealthSnapshotAction
    ) {}

    public function execute(User $user, Asset $asset, array $data): Asset
    {
        $asset->update($data);

        $this->updateWealthSnapshotAction->execute($user);

        return $asset;
    }
}
