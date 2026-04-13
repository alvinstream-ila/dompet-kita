<?php

namespace App\Actions\Finance\Asset;

use App\Actions\BaseAction;
use App\Actions\Finance\Wealth\UpdateWealthSnapshotAction;
use App\Models\Asset;
use App\Models\User;

class CreateAssetAction extends BaseAction
{
    public function __construct(
        protected UpdateWealthSnapshotAction $updateWealthSnapshotAction
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, array $data): Asset
    {
        $data['user_id'] = $user->id;

        if (! isset($data['invested_capital'])) {
            $data['invested_capital'] = $data['value'];
        }

        $asset = Asset::create($data);

        $this->updateWealthSnapshotAction->execute($user);

        return $asset;
    }
}
