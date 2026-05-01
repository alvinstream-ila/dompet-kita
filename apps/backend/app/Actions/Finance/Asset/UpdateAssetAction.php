<?php

declare(strict_types=1);

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

    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, Asset $asset, array $data): Asset
    {
        // 🛡️ Defense in Depth: Ensure asset belongs to user's household
        abort_unless($asset->household_id === $user->household_id, 403, 'Anda tidak memiliki akses ke aset ini.');

        $asset->update($data);

        $this->updateWealthSnapshotAction->execute($user);

        return $asset;
    }
}
