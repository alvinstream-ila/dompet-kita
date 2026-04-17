<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GroqProvider implements AiProviderInterface
{
    protected string $apiKey;

    protected string $model;

    protected string $baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

    public function __construct()
    {
        $apiKey = \config('services.ai.groq.key');
        $model = \config('services.ai.groq.model');

        $this->apiKey = is_string($apiKey) ? $apiKey : '';
        $this->model = is_string($model) ? $model : 'llama3-8b-8192';
    }

    public function getName(): string
    {
        return 'Groq';
    }

    public function isAvailable(): bool
    {
        return ! empty($this->apiKey);
    }

    public function supportsVision(): bool
    {
        return false;
    }

    public function supportsAudio(): bool
    {
        return false; // Groq uses separate audio endpoints, implementation pending
    }

    public function generateText(string $prompt): array
    {
        $tracer = app(LangSmithTracer::class);
        $runId = $tracer->createRun('Groq:generateText', [
            'prompt' => $prompt,
            'model' => $this->model,
        ]);

        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
                ->post($this->baseUrl, [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.1,
                ]);

            if ($response->failed()) {
                throw new \Exception('Groq API Error ('.$response->status().'): '.$response->body());
            }

            $content = $response->json('choices.0.message.content');
            $promptTokens = $response->json('usage.prompt_tokens');
            $completionTokens = $response->json('usage.completion_tokens');
            $totalTokens = $response->json('usage.total_tokens');

            $output = [
                'text' => is_string($content) ? $content : '',
                'usage' => [
                    'prompt_tokens' => is_int($promptTokens) ? $promptTokens : 0,
                    'completion_tokens' => is_int($completionTokens) ? $completionTokens : 0,
                    'total_tokens' => is_int($totalTokens) ? $totalTokens : 0,
                ],
            ];

            $tracer->updateRun($runId, $output);

            return $output;
        } catch (\Exception $e) {
            Log::error('Groq generateText error: '.$e->getMessage());
            $tracer->updateRun($runId, [], $e);
            throw $e;
        }
    }

    public function generateFromImage(string $prompt, string $base64Image, string $mimeType): array
    {
        throw new \Exception('Vision not supported by current Groq model configuration.');
    }

    public function generateFromAudio(string $prompt, string $base64Audio, string $mimeType): array
    {
        throw new \Exception('Audio/Voice processing is handled by Gemini provider.');
    }
}
