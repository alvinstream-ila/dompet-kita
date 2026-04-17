<?php

declare(strict_types=1);

namespace App\Console\Commands\Security;

use App\Actions\Security\DeadMansSwitch\GenerateReportAction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessDeadMansSwitch extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'security:process-dead-mans-switch';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Audit inactivity thresholds and trigger digital inheritance if necessary';

    /**
     * Execute the console command.
     */
    public function handle(GenerateReportAction $generateReportAction): int
    {
        $this->info('🛡️  Processing Digital Inheritance Check...');

        // Find users who have not been active for their threshold (default 6 months if not set)
        $users = User::whereRaw('is_legacy_triggered IS FALSE')
            ->whereNotNull('last_active_at')
            ->get();

        $triggeredCount = 0;

        foreach ($users as $user) {
            $lastActive = $user->last_active_at;

            if ($lastActive === null) {
                continue;
            }

            $thresholdMonths = $user->legacy_threshold_months ?: 6;
            $cutoffDate = Carbon::now()->subMonths($thresholdMonths);

            if ($lastActive->lessThan($cutoffDate)) {
                $this->warn("🚨 Triggering Legacy Protocol for User: {$user->email} (Inactive since: {$lastActive})");

                try {
                    // Generate report
                    $generateReportAction->execute($user);

                    // Mark as triggered
                    $user->update(['is_legacy_triggered' => true]);

                    Log::critical("Digital Inheritance TRIGGERED for user {$user->id} due to inactivity threshold of {$thresholdMonths} months.");
                    $triggeredCount++;
                } catch (\Exception $e) {
                    $this->error("Failed to trigger legacy for user {$user->id}: ".$e->getMessage());
                    Log::error("Dead Man's Switch failure: ".$e->getMessage());
                }
            }
        }

        $this->info("✅ Process complete. Triggered for {$triggeredCount} users.");

        return 0;
    }
}
