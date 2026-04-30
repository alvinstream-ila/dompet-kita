<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * LangSmith Tracer Service
 *
 * Provides transparent observability for AI models using the LangSmith REST API.
 * Follows the "Expert Standard" for AI tracing without a native SDK.
 */
class LangSmithTracer
{
    private readonly ?string $apiKey;

    private readonly string $project;

    private string $baseUrl = 'https://api.smith.langchain.com';

    public function __construct()
    {
        $apiKey = \config('services.ai.langsmith.key');
        $this->apiKey = is_string($apiKey) ? $apiKey : null;

        $project = \config('services.ai.langsmith.project', 'dompet-kita-backend');
        $this->project = is_string($project) ? $project : 'dompet-kita-backend';
    }

    /**
     * Start a new trace run in LangSmith.
     *
     * @param  array<string, mixed>  $inputs
     */
    public function createRun(string $name, array $inputs, string $runType = 'llm'): ?string
    {
        if (! $this->apiKey) {
            return null;
        }

        $id = Str::uuid()->toString();
        $startTime = now()->toIso8601ZuluString();

        try {
            Http::withHeaders(['x-api-key' => $this->apiKey])
                ->timeout(2)
                ->retry(2, 50)
                ->post("{$this->baseUrl}/runs", [
                    'id' => $id,
                    'name' => $name,
                    'run_type' => $runType,
                    'inputs' => $inputs,
                    'start_time' => $startTime,
                    'project_name' => $this->project,
                ]);

            return $id;
        } catch (\Exception $e) {
            Log::warning('LangSmith Trace Start Failed: '.$e->getMessage());

            return null;
        }
    }

    /**
     * Finalize a run with outputs and end time.
     *
     * @param  array<string, mixed>  $outputs
     */
    public function updateRun(?string $runId, array $outputs, ?\Throwable $error = null): void
    {
        if (! $this->apiKey || ! $runId) {
            return;
        }

        $endTime = now()->toIso8601ZuluString();
        $payload = [
            'outputs' => $outputs,
            'end_time' => $endTime,
        ];

        if ($error instanceof \Throwable) {
            $payload['error'] = $error->getMessage();
        }

        try {
            Http::withHeaders(['x-api-key' => $this->apiKey])
                ->timeout(2)
                ->retry(2, 50)
                ->patch("{$this->baseUrl}/runs/{$runId}", $payload);
        } catch (\Exception $e) {
            Log::warning('LangSmith Trace Update Failed: '.$e->getMessage());
        }
    }
}
