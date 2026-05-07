<?php

declare(strict_types=1);

namespace App\Services\AI;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouterProvider implements AiProviderInterface
{
    protected string $apiKey;

    protected string $modelText;

    protected string $modelVision;

    protected string $model;

    protected string $baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

    public function __construct()
    {
        $apiKey = \config('services.ai.openrouter.key');
        $this->apiKey = is_string($apiKey) ? $apiKey : '';

        $modelText = \config('services.ai.openrouter.model_text', 'google/gemini-2.0-flash-001');
        $this->modelText = is_string($modelText) ? $modelText : 'google/gemini-2.0-flash-001';

        $modelVision = \config('services.ai.openrouter.model_vision', 'google/gemini-2.0-flash-001');
        $this->modelVision = is_string($modelVision) ? $modelVision : 'google/gemini-2.0-flash-001';

        // Legacy support/default
        $this->model = $this->modelText;
    }

    protected function getHttpClient(): PendingRequest
    {
        return Http::withToken($this->apiKey)
            ->timeout(30)
            ->retry(3, 100)
            ->withHeaders([
                'HTTP-Referer' => config('app.url'),
                'X-Title' => config('app.name'),
                'User-Agent' => 'DompetKita-AI/1.0 (OpenRouter)',
            ]);
    }

    public function getName(): string
    {
        return 'OpenRouter';
    }

    public function isAvailable(): bool
    {
        return $this->apiKey !== '' && $this->apiKey !== '0';
    }

    public function supportsVision(): bool
    {
        return true;
    }

    public function supportsAudio(): bool
    {
        return false; // OpenRouter audio support depends on specific models, not implemented yet.
    }

    public function generateText(string $prompt): array
    {
        /** @var LangSmithTracer $tracer */
        $tracer = app(LangSmithTracer::class);
        $runId = $tracer->createRun('OpenRouter:generateText', [
            'prompt' => $prompt,
            'model' => $this->modelText,
        ]);

        try {
            $response = $this->getHttpClient()
                ->post($this->baseUrl, [
                    'model' => $this->modelText,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.1,
                ]);

            if ($response->failed()) {
                throw new \Exception('OpenRouter API Error ('.$response->status().'): '.$response->body());
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
            Log::error('OpenRouter generateText error: '.$e->getMessage());
            $tracer->updateRun($runId, [], $e);
            throw $e;
        }
    }

    public function generateFromImage(string $prompt, string $base64Image, string $mimeType): array
    {
        /** @var LangSmithTracer $tracer */
        $tracer = app(LangSmithTracer::class);
        $runId = $tracer->createRun('OpenRouter:generateFromImage', [
            'prompt' => $prompt,
            'model' => $this->modelVision,
            'mime_type' => $mimeType,
        ]);

        try {
            $response = $this->getHttpClient()
                ->post($this->baseUrl, [
                    'model' => $this->modelVision,
                    'messages' => [
                        [
                            'role' => 'user',
                            'content' => [
                                ['type' => 'text', 'text' => $prompt],
                                [
                                    'type' => 'image_url',
                                    'image_url' => [
                                        'url' => "data:{$mimeType};base64,{$base64Image}",
                                    ],
                                ],
                            ],
                        ],
                    ],
                    'temperature' => 0.1,
                ]);

            if ($response->failed()) {
                throw new \Exception('OpenRouter Vision Error ('.$response->status().'): '.$response->body());
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
            Log::error('OpenRouter vision error: '.$e->getMessage());
            $tracer->updateRun($runId, [], $e);
            throw $e;
        }
    }

    public function generateFromAudio(string $prompt, string $base64Audio, string $mimeType): array
    {
        throw new \Exception('Audio/Voice processing is handled by Gemini provider.');
    }
}
