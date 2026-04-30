<?php

declare(strict_types=1);

namespace App\Console\Commands\Security;

use App\Actions\Security\PerformSecurityAuditAction;
use Exception;
use Illuminate\Console\Command;

class SecurityGate extends Command
{
    private const string SEPARATOR = '===============================';

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'security:gate {--min-score=100 : Minimum acceptable security score}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Security Gate: Ensure code meets elite quality and security standards before commit/deploy';

    /**
     * Execute the console command.
     */
    public function handle(PerformSecurityAuditAction $action): int
    {
        try {
            $this->info('🛡️  DOMPET KITA - SECURITY GATE');
            $this->info(self::SEPARATOR);

            $minScore = (int) $this->option('min-score');
            $this->comment("Checking if system health meets threshold: {$minScore}/100");

            $result = $action->execute();
            $score = $result['score'];

            foreach ($result['findings'] as $finding) {
                $this->warn("- {$finding}");
            }

            $this->newLine();

            if ($score < $minScore) {
                $this->error("Gate Result: [FAILED] - Score {$score}/100 does not meet threshold {$minScore}/100");
                $this->info(self::SEPARATOR);

                return 1;
            }

            $this->info("Gate Result: [PASSED] - Score {$score}/100 meets threshold {$minScore}/100");
            $this->info(self::SEPARATOR);

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
