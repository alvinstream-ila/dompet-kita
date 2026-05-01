<?php

declare(strict_types=1);

namespace App\Actions\Security;

use App\Actions\BaseAction;
use App\Models\LoginHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class PerformSecurityAuditAction extends BaseAction
{
    /**
     * Perform security audit.
     *
     * @return array{score: int, findings: array<int, string>}
     */
    public function execute(): array
    {
        $score = 100;
        $findings = [];

        $this->auditLoginHistory($score, $findings);
        $this->auditSensitiveFileExposure($score, $findings);
        $this->auditRLS($score, $findings);
        $this->auditActivityLog($findings);
        $this->audit2FA($findings);
        $this->auditLogSanity($score, $findings);
        $this->auditTestCoverage($score, $findings);
        $this->auditDebugMode($score, $findings);

        return [
            'score' => max(0, $score),
            'findings' => $findings,
        ];
    }

    /**
     * @param  array<int, string>  $findings
     */
    private function auditLoginHistory(int &$score, array &$findings): void
    {
        $suspiciousLogins = LoginHistory::where('created_at', '>=', now()->subDay())
            ->select('ip_address')
            ->distinct()
            ->count();

        if ($suspiciousLogins > 3) {
            $findings[] = "Multiple unique IPs ({$suspiciousLogins}) accessed your account in 24h. Check for session leaks.";
            $score -= 15;
        }
    }

    /**
     * @param  array<int, string>  $findings
     */
    private function auditSensitiveFileExposure(int &$score, array &$findings): void
    {
        // Check for .env in public
        if (File::exists(public_path('.env'))) {
            $findings[] = 'CRITICAL: .env file found in public folder! Data leak imminent.';
            $score -= 50;
        }

        // Check for .git directory in public
        if (File::isDirectory(public_path('.git'))) {
            $findings[] = 'CRITICAL: .git directory is publicly accessible! Source code is exposed.';
            $score -= 40;
        }

        // Check for phpinfo.php in public
        if (File::exists(public_path('phpinfo.php'))) {
            $findings[] = 'WARNING: phpinfo.php found in public folder. Remove immediately.';
            $score -= 20;
        }

        // Check for .DS_Store in public (macOS metadata leakage)
        if (File::exists(public_path('.DS_Store'))) {
            $findings[] = 'INFO: .DS_Store found in public folder. Reveals directory structure.';
            $score -= 5;
        }
    }

    /**
     * @param  array<int, string>  $findings
     */
    private function auditRLS(int &$score, array &$findings): void
    {
        // Dynamically check RLS on all known household-scoped tables
        $householdTables = ['transactions', 'assets', 'goals', 'loans', 'budgets', 'insights'];

        /** @var array<int, \stdClass> $rlsStatus */
        $rlsStatus = DB::select(
            "SELECT relname, relrowsecurity
             FROM pg_class c
             JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'public'
             AND relname = ANY(?)",
            ['{'.implode(',', $householdTables).'}']
        );

        foreach ($rlsStatus as $tableRow) {
            if (isset($tableRow->relrowsecurity) && ! $tableRow->relrowsecurity) {
                $tableName = isset($tableRow->relname) ? (string) $tableRow->relname : 'unknown';
                $findings[] = "Database Row Level Security (RLS) is not active on '{$tableName}' table.";
                $score -= 10;
            }
        }
    }

    /**
     * @param  array<int, string>  $findings
     */
    private function auditActivityLog(array &$findings): void
    {
        if (DB::table('activity_log')->count() === 0 && DB::table('users')->count() > 0) {
            $findings[] = '[ADVISORY] Audit Trail (ActivityLog) is empty. Ensure trail logging is active for production.';
        }
    }

    /**
     * @param  array<int, string>  $findings
     */
    private function audit2FA(array &$findings): void
    {
        $usersWithout2FA = DB::table('users')->whereRaw('two_factor_enabled = false')->count();
        if ($usersWithout2FA > 0) {
            $findings[] = "[ADVISORY] Security Hygiene: {$usersWithout2FA} user(s) have not enabled Two-Factor Authentication (2FA).";
        }
    }

    /**
     * Memory-safe log audit: reads only the last 50KB of the log file
     * using fseek to avoid loading multi-gigabyte logs into memory.
     *
     * @param  array<int, string>  $findings
     */
    private function auditLogSanity(int &$score, array &$findings): void
    {
        $logPath = storage_path('logs/laravel.log');
        if (! File::exists($logPath)) {
            return;
        }

        $handle = fopen($logPath, 'r');
        if ($handle === false) {
            return;
        }

        try {
            $chunkSize = 50_000; // 50KB
            $fileSize = filesize($logPath);
            if ($fileSize !== false && $fileSize > $chunkSize) {
                fseek($handle, -$chunkSize, SEEK_END);
            }
            $logContent = fread($handle, $chunkSize);
        } finally {
            fclose($handle);
        }

        if ($logContent === false || $logContent === '') {
            return;
        }

        $sensitiveKeywords = ['DB_PASSWORD', 'APP_KEY', 'AWS_SECRET', 'STRIPE_SECRET', 'BACKUP_PASSWORD', 'DB_URL'];
        foreach ($sensitiveKeywords as $keyword) {
            if (str_contains($logContent, $keyword)) {
                $findings[] = "Log Leak Warning: Found sensitive keyword '{$keyword}' in recent system logs.";
                $score -= 5;
                break;
            }
        }
    }

    /**
     * @param  array<int, string>  $findings
     */
    private function auditTestCoverage(int &$score, array &$findings): void
    {
        $testPath = base_path('tests/Feature');
        if (! File::isDirectory($testPath) || count(File::allFiles($testPath)) < 3) {
            $findings[] = 'Security Risk: Regression test suite is incomplete.';
            $score -= 5;
        }
    }

    /**
     * Checks that APP_DEBUG is disabled in production to prevent
     * information disclosure in error responses.
     *
     * @param  array<int, string>  $findings
     */
    private function auditDebugMode(int &$score, array &$findings): void
    {
        if (app()->isProduction() && config('app.debug') === true) {
            $findings[] = 'CRITICAL: APP_DEBUG is enabled in production! Stack traces are publicly visible.';
            $score -= 30;
        }
    }
}
