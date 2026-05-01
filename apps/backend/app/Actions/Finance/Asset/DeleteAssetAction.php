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
        // 🛡️ Defense in Depth: Ensure asset belongs to user's household
        abort_unless($asset->household_id === $user->household_id, 403, 'Anda tidak memiliki akses ke aset ini.');

        $deleted = $asset->delete();

        $this->updateWealthSnapshotAction->execute($user);

        return $deleted;
    }
}
