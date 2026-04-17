<?php

namespace App\Actions\Security\DeadMansSwitch;

use App\Actions\BaseAction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class RecordActivityAction extends BaseAction
{
    /**
     * Record a user's digital heartbeat.
     */
    public function execute(User $user): void
    {
        $isInGrace = $user->legacy_grace_start_at !== null;

        $user->update([
            'last_active_at' => Carbon::now(),
            'is_legacy_triggered' => false,
            'legacy_grace_start_at' => null, // Deactivate grace period immediately on heartbeat
        ]);

        if ($isInGrace) {
            Log::alert("User {$user->id} recovered from Legacy Grace Period!");
        }

        Log::info("Digital Heartbeat recorded for user {$user->id}");
    }
}
