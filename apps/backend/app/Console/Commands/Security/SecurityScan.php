<?php

declare(strict_types=1);

namespace App\Console\Commands\Security;

use App\Actions\Security\ExecuteSecurityScanAction;
use Exception;
use Illuminate\Console\Command;

class SecurityScan extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'security:scan';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run a security audit on dependencies and codebase';

    /**
     * Execute the console command.
     */
    public function handle(ExecuteSecurityScanAction $action): int
    {
        try {
            $this->info('Starting Security Audit...');

            $result = $action->execute();

            // 1. Laravel Security Audit
            $this->info("\n--- Laravel Security Audit ---");
            $this->line($result['laravel']['output']);

            // 2. Composer Audit
            $this->info("\n--- Composer Audit ---");
            if ($result['composer']['success']) {
                $this->info('No vulnerabilities found in composer.');
            } else {
                $this->error($result['composer']['output']);
            }

            // 3. Snyk
            $this->info("\n--- Snyk Security Scan ---");
            if ($result['snyk']['success']) {
                $this->info('Snyk scan passed!');
            } else {
                $this->warn($result['snyk']['output'] ?: 'Snyk not installed or error running scan.');
            }

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
