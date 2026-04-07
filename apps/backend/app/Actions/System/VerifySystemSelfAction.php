<?php

declare(strict_types=1);

namespace App\Actions\System;

use App\Actions\BaseAction;
use Illuminate\Support\Facades\Process;

class VerifySystemSelfAction extends BaseAction
{
    /**
     * Run project maintenance and audit checks.
     *
     * @return array<string, array{success: bool, output: string}>
     */
    public function execute(): array
    {
        $results = [];

        // 1. Code Style (Pint)
        $pint = Process::run('"'.base_path('vendor/bin/pint').'" --test');
        $results['code_style'] = ['success' => $pint->successful(), 'output' => $pint->output()];

        // 2. Static Analysis (Larastan)
        $stan = Process::run('"'.base_path('vendor/bin/phpstan').'" analyse --memory-limit=1G');
        $results['static_analysis'] = ['success' => $stan->successful(), 'output' => $stan->output()];

        // 3. Secrets Scan
        $sonar = Process::run('sonar analyze secrets .');
        $results['secrets_scan'] = ['success' => $sonar->successful(), 'output' => $sonar->output()];

        // 4. Design Vibe Check
        $vibe = Process::run('node "'.base_path('../frontend/scripts/VibeGuard.js').'"');
        $results['design_vibe'] = ['success' => $vibe->successful(), 'output' => $vibe->output()];

        return $results;
    }
}
