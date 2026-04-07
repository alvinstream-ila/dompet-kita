<?php

declare(strict_types=1);

namespace App\Console\Commands\System;

use App\Actions\System\VerifySystemSelfAction;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class MaintenanceVerify extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'maintenance:verify {script?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run project maintenance scripts';

    private const SEPARATOR = '========================================';

    /**
     * Execute the console command.
     */
    public function handle(VerifySystemSelfAction $action): int
    {
        try {
            $script = $this->argument('script');

            if ($script) {
                return $this->handleCustomScript((string) $script);
            }

            $this->info(self::SEPARATOR);
            $this->info('🔍 DOMPET KITA - SYSTEM AUDIT & VITALITY CHECK');
            $this->info(self::SEPARATOR);

            $results = $action->execute();

            $this->bullet('Checking Code Style (Laravel Pint)...');
            $this->line($results['code_style']['output']);

            $this->bullet('Running Static Analysis (Larastan)...');
            $this->line($results['static_analysis']['output']);

            $this->bullet('Real-Time Code Secrets Detection (SonarQube CLI)...');
            $this->line($results['secrets_scan']['output']);

            $this->bullet('Performing Premium Design Vibe Check...');
            $this->line($results['design_vibe']['output']);

            // Nested command calls are preserved but wrapped in Action usage where possible
            $this->bullet('Running Audit Sub-Suites...');
            $this->call('security:audit');
            $this->call('market:sync');
            $this->call('security:deep-audit');
            $this->call('cloud:sync');
            $this->call('db:optimize', ['--force' => true]);

            $this->bullet('Running Legacy Maintenance Scripts...');
            $this->runExternalProcess('php "'.base_path('maintenance/verify_local.php').'"');
            $this->runExternalProcess('php "'.base_path('maintenance/verify_all_models.php').'"');

            $this->info(self::SEPARATOR);
            $this->info('✅ AUDIT COMPLETE');
            $this->info(self::SEPARATOR);

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }

    private function handleCustomScript(string $script): int
    {
        $maintenanceDir = base_path('maintenance');
        $command = "php \"{$maintenanceDir}".DIRECTORY_SEPARATOR."{$script}\"";

        return $this->runExternalProcess($command);
    }

    private function bullet(string $text): void
    {
        $this->line("\n🔹 ".$text);
    }

    private function runExternalProcess(string $command): int
    {
        $result = Process::timeout(300)->run($command);

        if ($result->successful()) {
            $this->line($result->output());
        } else {
            $this->warn($result->output());
            $this->error($result->errorOutput());
        }

        return $result->exitCode() ?? 1;
    }
}
