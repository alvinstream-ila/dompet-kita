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
    private ?string $apiKey;
    private string $project;
    private string $baseUrl = 'https://api.smith.langchain.com';

    public function __construct()
    {
        $this->apiKey = env('LANGSMITH_API_KEY');
        $this->project = env('LANGSMITH_PROJECT', 'dompet-kita-backend');
    }

    /**
     * Start a new trace run in LangSmith.
     */
    public function createRun(string $name, array $inputs, string $runType = 'llm'): ?string
    {
        if (!$this->apiKey) {
            return null;
        }

        $id = Str::uuid()->toString();
        $startTime = now()->toIso8601ZuluString();

        try {
            Http::withHeaders(['x-api-key' => $this->apiKey])
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
            Log::warning("LangSmith Trace Start Failed: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Finalize a run with outputs and end time.
     */
    public function updateRun(?string $runId, array $outputs, ?\Throwable $error = null): void
    {
        if (!$this->apiKey || !$runId) {
            return;
        }

        $endTime = now()->toIso8601ZuluString();
        $payload = [
            'outputs' => $outputs,
            'end_time' => $endTime,
        ];

        if ($error) {
            $payload['error'] = $error->getMessage();
        }

        try {
            Http::withHeaders(['x-api-key' => $this->apiKey])
                ->patch("{$this->baseUrl}/runs/{$runId}", $payload);
        } catch (\Exception $e) {
            Log::warning("LangSmith Trace Update Failed: " . $e->getMessage());
        }
    }
}
