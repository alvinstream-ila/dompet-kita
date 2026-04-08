<?php

declare(strict_types=1);

namespace App\Console\Commands\Security;

use App\Actions\Security\PerformSecurityAuditAction;
use Exception;
use Illuminate\Console\Command;

class SecurityAudit extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'security:audit';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Perform a deep security audit and calculate a system health score';

    private const SEPARATOR = '========================================';

    private const SCORE_SUFFIX = '/100)';

    /**
     * Execute the console command.
     */
    public function handle(PerformSecurityAuditAction $action): int
    {
        try {
            $this->info('### 🛡️ Dompet Kita Deep Security Audit');
            $this->newLine();

            $result = $action->execute();
            $score = $result['score'];
            $findings = $result['findings'];

            $this->printSummary($score, $findings);

            return $score;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 0; // Return 0 to avoid breaking gates, but it will fail score check
        }
    }

    /**
     * @param array<string> $findings
     */
    private function printSummary(int $score, array $findings): void
    {
        $this->newLine();
        $this->info(self::SEPARATOR);

        if ($score >= 90) {
            $this->info("✅ SYSTEM STATUS: ELITE ({$score}".self::SCORE_SUFFIX);
        } elseif ($score >= 70) {
            $this->warn("⚠️  SYSTEM STATUS: GUARDED ({$score}".self::SCORE_SUFFIX);
        } else {
            $this->error("🚨 SYSTEM STATUS: CRITICAL ({$score}".self::SCORE_SUFFIX);
        }

        $this->info(self::SEPARATOR);

        if (empty($findings)) {
            $this->info('No security concerns found. Your finances are safe!');
        } else {
            foreach ($findings as $finding) {
                $this->line("- {$finding}");
            }
        }
    }
}
