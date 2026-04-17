<?php

declare(strict_types=1);

namespace App\Actions\AI;

use App\Actions\BaseAction;
use App\Services\GeminiService;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class SystemHealthCheckAction extends BaseAction
{
    public function __construct(
        private readonly GeminiService $gemini
    ) {}

    /**
     * Execute full system health check.
     *
     * @return array{
     *     database: array{status: string, message: string},
     *     redis: array{status: string, message: string},
     *     ai_provider: array{status: string, message: string},
     *     overall_status: string
     * }
     */
    public function execute(): array
    {
        $report = [
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
            'ai_provider' => $this->checkAiProvider(),
        ];

        $allSafe = collect($report)->every(fn ($item) => $item['status'] === 'safe');
        $report['overall_status'] = $allSafe ? 'safe' : 'degraded';

        return $report;
    }

    /**
     * @return array{status: string, message: string}
     */
    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();

            return ['status' => 'safe', 'message' => 'Connected successfully.'];
        } catch (Exception $e) {
            return ['status' => 'critical', 'message' => $e->getMessage()];
        }
    }

    /**
     * @return array{status: string, message: string}
     */
    private function checkRedis(): array
    {
        try {
            Redis::connection()->ping();

            return ['status' => 'safe', 'message' => 'Redis is reachable.'];
        } catch (Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    /**
     * @return array{status: string, message: string}
     */
    private function checkAiProvider(): array
    {
        try {
            // Simple ping-like check for Gemini
            $this->gemini->analyzeFinancials("Respond with 'OK' if you can hear me.");

            return ['status' => 'safe', 'message' => 'Gemini AI is operational.'];
        } catch (Exception $e) {
            return ['status' => 'error', 'message' => 'AI Provider Communication Error: '.$e->getMessage()];
        }
    }
}
