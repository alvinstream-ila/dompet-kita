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
        $user->update([
            'last_active_at' => Carbon::now(),
            'is_legacy_triggered' => false, // Reset if they come back
        ]);

        Log::info("Digital Heartbeat recorded for user {$user->id}");
    }
}
