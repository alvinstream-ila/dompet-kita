<?php

declare(strict_types=1);

namespace App\Actions\AI;

use App\Actions\BaseAction;
use Illuminate\Support\Facades\File;

class PerformAiSelfAuditAction extends BaseAction
{
    /**
     * Execute self-audit and return a report of findings.
     *
     * @return array{
     *     architecture_violations: array<string>,
     *     technical_debt: array<string>,
     *     memory_health: bool,
     *     commands_count: int
     * }
     */
    public function execute(): array
    {
        return [
            'architecture_violations' => $this->checkArchitecture(),
            'technical_debt' => $this->checkTechnicalDebt(),
            'memory_health' => $this->checkMemoryPersistence(),
            'commands_count' => count(File::files(base_path('app/Console/Commands'))),
        ];
    }

    private function checkArchitecture(): array
    {
        $backendPath = base_path('app/Console/Commands');
        $commands = File::files($backendPath);
        $violations = [];

        foreach ($commands as $file) {
            $name = $file->getFilename();
            if (! preg_match('/^[A-Z][a-zA-Z]+\.php$/', $name)) {
                $violations[] = "Wrong naming format for $name";
            }
        }

        return $violations;
    }

    private function checkTechnicalDebt(): array
    {
        $debt = [];
        $files = File::allFiles(base_path('app'));

        foreach ($files as $file) {
            // Skip directory analysis for memory efficiency
            if ($file->isDir()) {
                continue;
            }

            $content = File::get($file->getPathname());

            if (str_contains($content, "config('services.storj")) {
                $debt[] = 'Found legacy Storj config in '.$file->getRelativePathname();
            }
        }

        return $debt;
    }

    private function checkMemoryPersistence(): bool
    {
        $memoryDir = base_path('../.antigravity/memory');

        return File::isDirectory($memoryDir);
    }
}
