<?php

declare(strict_types=1);

namespace App\Console\Commands\AI;

use App\Actions\AI\PerformAiSelfAuditAction;
use Illuminate\Console\Command;

class AiSelfAudit extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:self-audit';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'AI Self-Evaluation tool to scan for technical debt and architecture violations';

    private const SEPARATOR = '========================================';

    /**
     * Execute the console command.
     */
    public function handle(PerformAiSelfAuditAction $action): int
    {
        $this->info(self::SEPARATOR);
        $this->info('🧠 ANTIGRAVITY AI - SELF-AUDIT & EVOLUTION CHECK');
        $this->info(self::SEPARATOR);

        $report = $action->execute();

        // 1. Check for Architecture Violations
        $this->bullet('Checking Architecture Consistency...');
        $this->info('Total active commands: '.$report['commands_count']);

        if (empty($report['architecture_violations'])) {
            $this->info('✅ No architecture violations detected.');
        } else {
            foreach ($report['architecture_violations'] as $violation) {
                $this->warn('⚠️  Architecture Violation: '.$violation);
            }
        }

        // 2. Check for Technical Debt
        $this->bullet('Scanning for Technical Debt...');
        if (empty($report['technical_debt'])) {
            $this->info('✅ No obvious technical debt detected in business logic.');
        } else {
            foreach ($report['technical_debt'] as $debt) {
                $this->warn('⚠️  Technical Debt: '.$debt);
            }
        }

        // 3. Scan for Project Memory Health
        $this->bullet('Verifying Project Memory Persistence...');
        if ($report['memory_health']) {
            $this->info('✅ Long-term memory documents are alive and reachable (.antigravity/memory/).');
        } else {
            $this->error('❌ ERROR: Project Memory (.antigravity/memory/) is missing! Re-sync required.');
        }

        $this->info("\n".self::SEPARATOR);
        $this->info('✅ SELF-AUDIT COMPLETE');
        $this->info(self::SEPARATOR);

        return 0;
    }

    private function bullet(string $text): void
    {
        $this->line("\n🔹 ".$text);
    }
}
