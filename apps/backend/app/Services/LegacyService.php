<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

/**
 * LegacyService v7.1.18 Sovereign
 * Digital Inheritance Sentinel (Dead Man's Switch).
 */
class LegacyService
{
    public function __construct(
        protected SentinelService $sentinel
    ) {}

    /**
     * Scan for users who have exceeded their inactivity threshold.
     */
    public function checkAndTriggerDeadMansSwitch(): void
    {
        User::where('is_legacy_triggered', false)
            ->whereNotNull('last_active_at')
            ->whereNotNull('partner_id')
            ->each(function (User $user): void {
                $threshold = (int) ($user->legacy_threshold_months ?: 6); // Default 6 months

                $lastActive = $user->last_active_at;
                if ($lastActive instanceof Carbon) {
                    /** @var Carbon $lastActive */
                    if ($lastActive->copy()->addMonths($threshold)->isPast()) {
                        $this->triggerLegacy($user);
                    }
                }
            });
    }

    /**
     * Execute the Digital Legacy sequence.
     */
    private function triggerLegacy(User $user): void
    {
        // 1. Lock the trigger to prevent double execution
        $user->update(['is_legacy_triggered' => true]);

        // 2. Alert the partner via Sovereign Sentinel channel
        $this->sentinel->notify(
            "⚠️ Digital Legacy Sentinel Triggered for {$user->name}. Account security protocols shifted to Inheritance Mode.",
            'critical',
            [
                'user_id' => $user->id,
                'partner_id' => $user->partner_id,
                'last_active' => $user->last_active_at instanceof Carbon ? $user->last_active_at->toDateTimeString() : 'Never',
            ]
        );

        // 3. Audit Log for Sovereign compliance
        Log::channel('audit')->critical("LEGACY_SENTINEL_ACTIVATED: User {$user->id} exceeded inactivity threshold of {$user->legacy_threshold_months} months.");
    }
}
