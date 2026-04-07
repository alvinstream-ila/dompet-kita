<?php

declare(strict_types=1);

namespace App\Console\Commands\Security;

use App\Actions\Security\PerformDeepSecurityAuditAction;
use Exception;
use Illuminate\Console\Command;

class SecurityDeepAudit extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'security:deep-audit';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deep scan for dependency and infrastructure vulnerabilities (Snyk & Composer Audit)';

    /**
     * Execute the console command.
     */
    public function handle(PerformDeepSecurityAuditAction $action): int
    {
        try {
            $this->info('========================================');
            $this->info('🛡️  SNYK SENTINEL - DEEP SECURITY SCAN (v6.3)');
            $this->info('========================================');

            $result = $action->execute();

            // 1. Snyk Backend
            $this->bullet('Snyk: Scanning Backend Dependencies & Code (PHP)...');
            $this->printScanResult($result['snyk_backend']);

            // 2. Snyk Frontend
            $this->bullet('Snyk: Scanning Frontend Artifacts (JS/React)...');
            $this->printScanResult($result['snyk_frontend']);

            // 3. Infrastructure Leak Check
            $this->bullet('Sentinel: Scanning for Secret Exposure (.env / log)...');
            if ($result['secrets']['success']) {
                $this->info('✅ Secrets are safely isolated.');
            } else {
                foreach ($result['secrets']['findings'] as $finding) {
                    $this->error("❌ {$finding}");
                }
            }

            $this->info("\n========================================");
            $this->info('✨ SECURITY SENTINEL SYNCHRONIZED. SYSTEM HARDENED.');
            $this->info('========================================');

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }

    private function bullet(string $text): void
    {
        $this->line("\n🔹 ".$text);
    }

    private function printScanResult(array $result): void
    {
        if ($result['success']) {
            $this->line('✅ SUCCESS: No vulnerabilities found.');
        } else {
            $this->warn('⚠️  VULNERABILITIES DETECTED:');
            $this->error($result['output']);
        }
    }
}
