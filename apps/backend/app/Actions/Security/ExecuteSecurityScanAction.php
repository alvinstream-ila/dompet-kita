<?php

declare(strict_types=1);

namespace App\Actions\Security;

use App\Actions\BaseAction;
use Illuminate\Support\Facades\Process;

class ExecuteSecurityScanAction extends BaseAction
{
    /**
     * Run basic security scan.
     *
     * @return array{
     *     laravel: array{output: string},
     *     composer: array{success: bool, output: string},
     *     snyk: array{success: bool, output: string}
     * }
     */
    public function execute(): array
    {
        // 1. Laravel Security Audit
        $laravelResult = Process::run('php backend/artisan about --only=environment', null, base_path('..'));

        // 2. Composer Audit
        $composerResult = Process::run('composer audit', null, base_path());

        // 3. Basic Snyk Scan
        $snykResult = Process::run('snyk test', null, base_path());

        return [
            'laravel' => ['output' => $laravelResult->output()],
            'composer' => [
                'success' => $composerResult->successful(),
                'output' => $composerResult->output(),
            ],
            'snyk' => [
                'success' => $snykResult->successful(),
                'output' => $snykResult->output(),
            ],
        ];
    }
}
