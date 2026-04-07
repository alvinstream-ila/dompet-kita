<?php

declare(strict_types=1);

namespace App\Actions\Security;

use App\Actions\BaseAction;
use Illuminate\Support\Facades\Process;

class PerformDeepSecurityAuditAction extends BaseAction
{
    /**
     * Perform deep security scan.
     *
     * @return array{
     *     snyk_backend: array{success: bool, output: string},
     *     snyk_frontend: array{success: bool, output: string},
     *     secrets: array{success: bool, findings: string[]}
     * }
     */
    public function execute(): array
    {
        // 1. Snyk Backend Core Scan
        $backendResult = Process::run('snyk test --all-projects');

        // 2. Snyk Frontend Artifact Scan
        $frontendResult = Process::run('snyk test --file=../frontend/package.json');

        // 3. Secrets Isolation Check
        $secretsFindings = [];
        if (file_exists(base_path('.git'))) {
            $gitignoreFile = base_path('.gitignore');
            if (file_exists($gitignoreFile)) {
                $gitignore = file_get_contents($gitignoreFile);
                if (! str_contains($gitignore, '.env')) {
                    $secretsFindings[] = 'CRITICAL: .env is not in gitignore!';
                }
            }
        }

        return [
            'snyk_backend' => [
                'success' => $backendResult->successful(),
                'output' => $backendResult->output(),
            ],
            'snyk_frontend' => [
                'success' => $frontendResult->successful(),
                'output' => $frontendResult->output(),
            ],
            'secrets' => [
                'success' => empty($secretsFindings),
                'findings' => $secretsFindings,
            ],
        ];
    }
}
