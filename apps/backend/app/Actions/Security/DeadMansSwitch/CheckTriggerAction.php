<?php

namespace App\Actions\Security\DeadMansSwitch;

use App\Actions\BaseAction;
use App\Models\User;
use App\Notifications\LegacyTriggerNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CheckTriggerAction extends BaseAction
{
    public function __construct(
        protected GenerateReportAction $generateReportAction
    ) {}

    /**
     * The Sentinel: Check all users for the Dead Man's Switch trigger.
     * This should be called via a daily scheduled task.
     */
    public function execute(): int
    {
        $triggeredCount = 0;

        // Find users who have been inactive longer than their threshold
        $usersToTrigger = User::whereNotNull('last_active_at')
            ->where('is_legacy_triggered', false)
            ->whereNotNull('partner_id') // Must have a partner/heir
            ->get();

        foreach ($usersToTrigger as $user) {
            $thresholdDate = Carbon::now()->subMonths($user->legacy_threshold_months ?? 6);

            if ($user->last_active_at->lessThan($thresholdDate)) {
                $this->triggerLegacyProcess($user);
                $triggeredCount++;
            }
        }

        return $triggeredCount;
    }

    /**
     * Prepare the vault and notify the partner.
     */
    protected function triggerLegacyProcess(User $user): void
    {
        Log::warning("DEAD MAN'S SWITCH TRIGGERED for user {$user->id} (Inactive since {$user->last_active_at})");

        $user->update(['is_legacy_triggered' => true]);

        // Generate the final snapshot
        $reportData = $this->generateReportAction->execute($user);

        // Notify the partner
        $partner = $user->partner()->first();
        if ($partner) {
            $partner->notify(new LegacyTriggerNotification($user, $reportData));
            Log::info("Legacy notification sent to partner {$partner->id} for user {$user->id}");
        }
    }
}
