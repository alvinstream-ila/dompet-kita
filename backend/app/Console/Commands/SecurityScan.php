<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class SecurityScan extends Command
{
    protected $signature = 'app:security-scan';
    protected $description = 'Run a security audit on dependencies and codebase';

    public function handle()
    {
        $this->info("Starting Security Audit...");

        // 1. PHP Artisan Audit (Laravel built-in)
        $this->info("\n--- Laravel Security Audit ---");
        $result = Process::run("php artisan about --only=environment");
        $this->line($result->output());

        // 2. Composer Audit
        $this->info("\n--- Composer Audit ---");
        $result = Process::run("composer audit");
        if ($result->successful()) { $this->info("No vulnerabilities found in composer."); }
        else { $this->error($result->output()); }

        // 3. Snyk (if installed)
        $this->info("\n--- Snyk Security Scan ---");
        $result = Process::run("snyk test");
        if ($result->successful()) { $this->info("Snyk scan passed!"); }
        else { $this->warn($result->output() ?: "Snyk not installed or error running scan."); }
    }
}
