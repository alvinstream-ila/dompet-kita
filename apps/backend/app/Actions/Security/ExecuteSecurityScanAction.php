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
        $laravelResult = Process::path(base_path('..'))->run('php backend/artisan about --only=environment');

        // 2. Composer Audit
        $composerResult = Process::path(base_path())->run('composer audit');

        // 3. Basic Snyk Scan
        $snykResult = Process::path(base_path())->run('snyk test');

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
