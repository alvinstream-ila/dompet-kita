<?php

declare(strict_types=1);

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Services\SelfHealingService;

class PerformSelfHealingAction extends BaseAction
{
    public function __construct(
        private readonly SelfHealingService $healer
    ) {}

    /**
     * Execute self-healing protocol.
     *
     * @return array{
     *     diagnosis: string,
     *     ai_advice: string,
     *     actions_taken: array<string>,
     *     status: string
     * }
     */
    public function execute(bool $autoFix = false): array
    {
        $diagnosis = $this->healer->diagnoseRecentErrors();

        if (str_contains($diagnosis, 'No major errors')) {
            return [
                'diagnosis' => $diagnosis,
                'ai_advice' => 'System is healthy.',
                'actions_taken' => [],
                'status' => 'healthy',
            ];
        }

        $aiAdvice = $this->healer->getAiDeepDiagnosis($diagnosis);
        $actionsTaken = [];

        if ($autoFix) {
            $actionsTaken = $this->healer->executeFirstAid();
        }

        return [
            'diagnosis' => $diagnosis,
            'ai_advice' => $aiAdvice,
            'actions_taken' => $actionsTaken,
            'status' => 'anomaly_detected',
        ];
    }
}
