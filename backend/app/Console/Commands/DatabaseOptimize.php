<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Spatie\Activitylog\Models\Activity;

class DatabaseOptimize extends Command
{
    protected $signature = 'app:database-optimize {--force : Force cleanup without confirmation}';
    protected $description = 'Cleanup and optimize the system database and caches';

    public function handle()
    {
        $this->info("### 🧹 Dompet Kita - Pro Maintenance Suite");
        $this->newLine();

        if (!$this->option('force') && !$this->confirm('This will clear caches and prune activity logs older than 30 days. Proceed?')) {
            $this->warn("Optimization cancelled.");
            return 1;
        }

        // 1. Clear Application Caches
        $this->comment("Clearing application caches...");
        Artisan::call('optimize:clear');
        $this->info("✅ Caches (Route, View, Config, Data) Cleared.");

        // 2. Prune Activity Logs (Spatie)
        $this->comment("Pruning old activity logs (> 30 days)...");
        $deletedCount = Activity::where('created_at', '<', now()->subDays(30))->delete();
        $this->info("✅ Pruned $deletedCount old activity records.");

        // 3. System Optimization
        $this->comment("Re-optimizing application files...");
        Artisan::call('optimize');
        $this->info("✅ Application optimized for production.");

        $this->newLine();
        $this->info("========================================");
        $this->info("🏁 MAINTENANCE COMPLETE - Your system is now lean and fast!");
        $this->info("========================================");

        return 0;
    }
}
