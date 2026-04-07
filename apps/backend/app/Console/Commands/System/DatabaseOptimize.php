<?php

declare(strict_types=1);

namespace App\Console\Commands\System;

use App\Actions\System\OptimizeDatabaseAction;
use Exception;
use Illuminate\Console\Command;

class DatabaseOptimize extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'db:optimize {--force : Force cleanup without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cleanup and optimize the system database and caches';

    /**
     * Execute the console command.
     */
    public function handle(OptimizeDatabaseAction $action): int
    {
        try {
            $this->info('### 🧹 Dompet Kita - Pro Maintenance Suite');
            $this->newLine();

            if (! $this->option('force') && ! $this->confirm('This will clear caches and prune activity logs older than 30 days. Proceed?')) {
                $this->warn('Optimization cancelled.');

                return 1;
            }

            $this->comment('Running system-wide optimization...');
            $result = $action->execute();

            $this->info('✅ Application caches cleared.');
            $this->info("✅ Pruned {$result['pruned_logs']} old activity records.");
            $this->info('✅ Application optimized for production.');

            $this->newLine();
            $this->info('========================================');
            $this->info('🏁 MAINTENANCE COMPLETE - Your system is now lean and fast!');
            $this->info('========================================');

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
