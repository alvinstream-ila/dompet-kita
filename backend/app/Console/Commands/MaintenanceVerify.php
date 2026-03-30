<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class MaintenanceVerify extends Command
{
    protected $signature = 'maintenance:verify {script?}';
    protected $description = 'Run project maintenance scripts';

    public function handle()
    {
        $script = $this->argument('script');
        
        if ($script) {
            $maintenanceDir = base_path('maintenance');
            $this->runProcess("php \"$maintenanceDir" . DIRECTORY_SEPARATOR . "$script\"");
        } else {
            $this->info("========================================");
            $this->info("🔍 DOMPET KITA - SYSTEM AUDIT & VITALITY CHECK");
            $this->info("========================================");

            // 1. Code Style (Pint)
            $this->bullet("Checking Code Style (Laravel Pint)...");
            $this->runProcess("vendor/bin/pint --test");

            // 2. Static Analysis (PHPStan/Larastan)
            $this->bullet("Running Static Analysis (Larastan)...");
            $this->runProcess("vendor/bin/phpstan analyse --memory-limit=1G");

            // 3. Security Check (Enlightn & Snyk)
            $this->bullet("Running Deep Security Audit (Enlightn)...");
            if (file_exists('vendor/bin/enlightn')) {
                $this->runProcess("php artisan enlightn --no-interaction");
            } else {
                $this->warn("Enlightn not found. Skipping deep security check.");
            }
            $this->call('app:security-audit');

            // 4. Code Smells & Automated Refactoring (Rector)
            $this->bullet("Analyzing Code Smells & Refactoring (Rector)...");
            if (file_exists('vendor/bin/rector')) {
                $this->runProcess("vendor/bin/rector process --dry-run");
            } else {
                $this->warn("Rector not found. Skipping refactoring check.");
            }

            // 5. Developer Score (PHP Insights)
            $this->bullet("Gathering Quality Scores (PHP Insights)...");
            if (class_exists(\NunoMaduro\PhpInsights\Laravel\PhpInsightsServiceProvider::class)) {
                $this->runProcess("php artisan insights --no-interaction --summary");
            } else {
                $this->warn("PHP Insights not found. Skipping quality scoring.");
            }

            // 6. Cloud Connectivity
            $this->bullet("Checking Cloud Connectivity...");
            $this->call('app:cloud-sync');
            
            // 7. Database Hygiene
            $this->bullet("Optimizing Database & Caches...");
            $this->call('app:database-optimize', ['--force' => true]);

            // 7. Maintenance Scripts
            $this->bullet("Running Legacy Maintenance Scripts...");
            $this->runProcess("php maintenance/verify_local.php");
            $this->runProcess("php maintenance/verify_models.php");

            $this->info("========================================");
            $this->info("✅ AUDIT COMPLETE");
            $this->info("========================================");
        }
    }

    private function bullet($text)
    {
        $this->line("\n🔹 " . $text);
    }

    private function runProcess($command)
    {
        $result = Process::run($command);
        
        if ($result->successful()) {
            $this->line($result->output());
        } else {
            $this->warn($result->output());
            $this->error($result->errorOutput());
        }
    }
}
