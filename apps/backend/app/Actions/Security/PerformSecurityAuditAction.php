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
        if (File::exists(public_path('.env'))) {
            $findings[] = 'CRITICAL: .env file found in public folder! Data leak imminent.';
            $score -= 50;
        }
    }

    /**
     * @param  array<int, string>  $findings
     */
    private function auditRLS(int &$score, array &$findings): void
    {
        // RLS Check for PostgreSQL
        /** @var array<int, \stdClass> $rlsStatus */
        $rlsStatus = DB::select("SELECT relname, relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND relname = 'transactions'");

        if (! empty($rlsStatus) && isset($rlsStatus[0]->relrowsecurity) && ! $rlsStatus[0]->relrowsecurity) {
            $findings[] = 'Database Row Level Security (RLS) is not active on transactions table.';
            $score -= 20;
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
     * @param  array<int, string>  $findings
     */
    private function auditLogSanity(int &$score, array &$findings): void
    {
        $logPath = storage_path('logs/laravel.log');
        if (File::exists($logPath)) {
            $logContent = file_get_contents($logPath);
            if ($logContent !== false) {
                if (strlen($logContent) > 50000) {
                    $logContent = substr($logContent, -50000);
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
}
