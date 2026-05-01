<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Actions\Security\DeadMansSwitch\GenerateReportAction;
use App\Models\User;
use App\Notifications\LegacyGracePeriodNotification;
use App\Notifications\LegacyTriggerNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class CheckLegacyInactivity extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'legacy:check-inactivity';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = "Monitor user inactivity and manage the 7-day Grace Period before triggering the Dead Man's Switch.";

    /**
     * Execute the console command.
     */
    public function handle(GenerateReportAction $generateReportAction): void
    {
        $this->info('Scanning for inactive users [Grace Period Protocol v7.1.18]...');

        // Find users with legacy setup (partner or email) who are not already triggered
        $users = User::whereRaw('is_legacy_triggered IS FALSE')
            ->where(function ($query): void {
                $query->whereNotNull('partner_id')
                    ->orWhereNotNull('legacy_partner_email');
            })
            ->get();

        foreach ($users as $user) {
            $thresholdMonths = $user->legacy_threshold_months ?: 6;
            $cutoffDate = Carbon::now()->subMonths($thresholdMonths);

            // Case 1: Already in Grace Period
            if ($user->legacy_grace_start_at instanceof Carbon) {
                $daysElapsed = $user->legacy_grace_start_at->diffInDays(Carbon::now());

                if ($daysElapsed >= 7) {
                    $this->triggerFinalLegacy($user, $generateReportAction);
                } else {
                    $this->warn("User {$user->name} is in Grace Period (Day {$daysElapsed}). Sending daily reminder...");
                    $user->notify(new LegacyGracePeriodNotification($user, (int) (7 - $daysElapsed)));
                }

                continue;
            }

            // Case 2: Just became inactive
            if ($user->last_active_at && $user->last_active_at->lessThan($cutoffDate)) {
                $this->alert("User {$user->name} reached inactivity threshold. Starting 7-day Grace Period...");

                $user->update([
                    'legacy_grace_start_at' => Carbon::now(),
                ]);

                $user->notify(new LegacyGracePeriodNotification($user, 7));

                Log::warning("Legacy Grace Period started for user {$user->id} after {$thresholdMonths} months of inactivity.");
            }
        }

        $this->info('Inactivity scan complete.');
    }

    /**
     * Final trigger of the Dead Man's Switch after Grace Period expires.
     */
    protected function triggerFinalLegacy(User $user, GenerateReportAction $generateReportAction): void
    {
        $this->error("Grace Period EXPIRED for user {$user->name}. Opening the Vault!");

        try {
            // 1. Generate the final snapshot
            $report = $generateReportAction->execute($user);
            $filename = $report['filename'];
            $reportData = $report['data'];

            // 2. Prepare report data for notification (Already in $reportData, but we can enrich it)
            $notificationData = [
                'filename' => $filename,
                'financial_summary' => $reportData['financial_summary'],
                'vault_url' => (string) config('app.frontend_url', '').'/legacy-vault/claim?token='.bin2hex(random_bytes(16)),

            ];

            // 3. Notify Partner (Internal or External)
            $partner = $user->partner;
            if ($partner instanceof User) {
                $partner->notify(new LegacyTriggerNotification($user, $notificationData));
            } elseif ($user->legacy_partner_email) {
                // Logic for external email notification can be added here
                Log::info("Sending legacy trigger to external email: {$user->legacy_partner_email}");
            }

            // 4. Update status
            $user->update([
                'is_legacy_triggered' => true,
                'legacy_grace_start_at' => null, // Clear grace start as it's finished
            ]);

            Log::emergency("Dead Man's Switch COMPLETED for user {$user->id}. Partner notified.");
        } catch (\Exception $e) {
            $this->error("CRITICAL: Failed to execute legacy trigger for user {$user->id}: ".$e->getMessage());
            Log::critical('Legacy trigger fatal error: '.$e->getMessage());
        }
    }
}
