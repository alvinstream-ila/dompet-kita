<?php

namespace App\Console\Commands;

use App\Models\LoginHistory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class SecurityAudit extends Command
{
    protected $signature = 'app:security-audit';
    protected $description = 'Perform a deep security audit and calculate a system health score';

    public function handle()
    {
        $this->info("### 🛡️ Dompet Kita Deep Security Audit");
        $this->newLine();

        $score = 100;
        $findings = [];

        // 1. Audit Login History (24h)
        $this->comment("Checking suspicious login activity (24h)...");
        $suspiciousLogins = LoginHistory::where('created_at', '>=', now()->subDay())
            ->select('ip_address')
            ->distinct()
            ->count();

        if ($suspiciousLogins > 3) {
            $findings[] = "Multiple unique IPs ($suspiciousLogins) accessed your account in 24h. Check for session leaks.";
            $score -= 15;
        }

        // 2. Audit Sensitive File Exposure (Simulated)
        $this->comment("Checking for sensitive file exposure...");
        if (File::exists(public_path('.env'))) {
            $findings[] = "CRITICAL: .env file found in public folder! Data leak imminent.";
            $score -= 50;
        }

        // 3. Audit RLS and Data Encryption Status
        $this->comment("Checking data protection layers...");
        $rlsStatus = DB::select("SELECT relname, relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND relname = 'transactions'");
        
        if (!empty($rlsStatus) && !$rlsStatus[0]->relrowsecurity) {
            $findings[] = "Database Row Level Security (RLS) is not active on transactions table.";
            $score -= 20;
        }

        // 4. Activity Log Status
        if (DB::table('activity_log')->count() === 0) {
            $findings[] = "Audit Trail (ActivityLog) is empty. Ensure trail logging is active.";
            $score -= 5;
        }

        // --- Summary Report ---
        $this->newLine();
        $this->info("========================================");
        if ($score >= 90) {
            $this->info("✅ SYSTEM STATUS: ELITE (" . $score . "/100)");
        } elseif ($score >= 70) {
            $this->warn("⚠️  SYSTEM STATUS: GUARDED (" . $score . "/100)");
        } else {
            $this->error("🚨 SYSTEM STATUS: CRITICAL (" . $score . "/100)");
        }
        $this->info("========================================");

        if (empty($findings)) {
            $this->info("No security concerns found. Your finances are safe!");
        } else {
            foreach ($findings as $finding) {
                $this->line("- $finding");
            }
        }

        return 0;
    }
}
