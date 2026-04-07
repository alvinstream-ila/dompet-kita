<?php

declare(strict_types=1);

namespace App\Console\Commands\AI;

use App\Actions\AI\PerformSelfHealingAction;
use Exception;
use Illuminate\Console\Command;

class AiSelfHeal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:self-heal {--auto-fix : Automate repair steps (cache clear)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'AI Autopilot: Scan system logs, diagnose errors, and trigger self-healing protocols';

    /**
     * Execute the console command.
     */
    public function handle(PerformSelfHealingAction $action): int
    {
        $this->info('🩺 DOMPET KITA - SYSTEM AUTO-DIAGNOSTIC & SELF-HEALING');
        $this->info('=====================================================');

        try {
            $isAutoFix = (bool) $this->option('auto-fix');

            $this->comment('🔍 Analyzing system state...');
            $result = $action->execute($isAutoFix);

            if ($result['status'] === 'healthy') {
                $this->info('✅ '.$result['diagnosis']);

                $this->comment("\n🧬 Running Deep Integrity Audit...");
                $this->call('maintenance:verify');

                return 0;
            }

            $this->error('🚨 ANOMALY DETECTED IN RECENT LOGS!');
            $this->line('-----------------------------------------------------');

            $this->info('✨ AI DIAGNOSIS REPORT:');
            $this->line($result['ai_advice']);
            $this->line('-----------------------------------------------------');

            if ($isAutoFix) {
                $this->comment('🚀 Triggering Automated Self-Healing...');
                foreach ($result['actions_taken'] as $actionItem) {
                    $this->info("   ✅ $actionItem");
                }
                $this->info('✨ System restored to stable state.');
            } else {
                $this->warn('💡 TIP: Run with --auto-fix to automatically clear cache and optimize config.');
            }

        } catch (Exception $e) {
            $this->error("Fatal Error during self-healing: {$e->getMessage()}");

            return 1;
        }

        $this->info("\n=====================================================");
        $this->info('🩺 DIAGNOSTIC COMPLETE');
        $this->info('=====================================================');

        return 0;
    }
}
