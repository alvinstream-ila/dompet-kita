<?php

declare(strict_types=1);

namespace App\Services\AI;

use Exception;
use Gemini;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiProvider implements AiProviderInterface
{
    protected string $apiKey;

    protected string $model = 'gemini-1.5-flash';

    public function __construct()
    {
        $apiKey = \config('services.ai.gemini.key');
        $this->apiKey = is_string($apiKey) ? $apiKey : '';

        $model = \config('services.ai.gemini.model', 'gemini-1.5-flash');
        $this->model = is_string($model) ? $model : 'gemini-1.5-flash';
    }

    public function getName(): string
    {
        return 'Gemini';
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
        return true;
    }

    public function generateText(string $prompt): array
    {
        /** @var LangSmithTracer $tracer */
        $tracer = app(LangSmithTracer::class);
        $runId = $tracer->createRun('Gemini:generateText', [
            'prompt' => $prompt,
            'model' => $this->model,
        ]);

        try {
            $client = Gemini::client($this->apiKey);
            $response = $client->generativeModel($this->model)->generateContent($prompt);

            $usage = $response->usageMetadata;

            $output = [
                'text' => $response->text(),
                'usage' => [
                    'prompt_tokens' => (int) ($usage->promptTokenCount),
                    'completion_tokens' => (int) ($usage->candidatesTokenCount),
                    'total_tokens' => (int) ($usage->totalTokenCount),
                ],
            ];

            $tracer->updateRun($runId, $output);

            return $output;
        } catch (Exception $e) {
            $message = str_replace($this->apiKey, '***HIDDEN***', $e->getMessage());
            Log::error('Gemini generateText error: '.$message);
            $tracer->updateRun($runId, [], $e);
            throw $e;
        }
    }

    /**
     * @return array{text: string, usage: array{prompt_tokens: int, completion_tokens: int, total_tokens: int}}
     */
    public function generateFromImage(string $prompt, string $base64Image, string $mimeType): array
    {
        return $this->generateWithMultimedia($prompt, $base64Image, $mimeType);
    }

    /**
     * @return array{text: string, usage: array{prompt_tokens: int, completion_tokens: int, total_tokens: int}}
     */
    public function generateFromAudio(string $prompt, string $base64Audio, string $mimeType): array
    {
        return $this->generateWithMultimedia($prompt, $base64Audio, $mimeType);
    }

    /**
     * Common helper for multimedia (image/audio) generation.
     *
     * @return array{text: string, usage: array{prompt_tokens: int, completion_tokens: int, total_tokens: int}}
     */
    protected function generateWithMultimedia(string $prompt, string $base64Data, string $mimeType): array
    {
        /** @var LangSmithTracer $tracer */
        $tracer = app(LangSmithTracer::class);
        $runId = $tracer->createRun('Gemini:multimedia', [
            'prompt' => $prompt,
            'model' => $this->model,
            'mime_type' => $mimeType,
        ]);

        try {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$this->model}:generateContent?key={$this->apiKey}";

            $payload = [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $base64Data,
                                ],
                            ],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.1,
                ],
            ];

            $response = Http::timeout(120)
                ->retry(3, 100)
                ->withHeaders(['User-Agent' => 'DompetKita-AI/1.0 (Gemini)'])
                ->post($url, $payload);

            if (! $response->successful()) {
                throw new \RuntimeException('Gemini API Error: '.$response->body());
            }

            /** @var array<string, mixed> $data */
            $data = $response->json();

            /** @var array<int, array{content: array{parts: array<int, array{text: string}>}}> $candidates */
            $candidates = $data['candidates'] ?? [];
            $text = $candidates[0]['content']['parts'][0]['text'] ?? '';

            /** @var array{promptTokenCount?: int, candidatesTokenCount?: int, totalTokenCount?: int} $usage */
            $usage = $data['usageMetadata'] ?? [];

            $output = [
                'text' => $text,
                'usage' => [
                    'prompt_tokens' => $usage['promptTokenCount'] ?? 0,
                    'completion_tokens' => $usage['candidatesTokenCount'] ?? 0,
                    'total_tokens' => $usage['totalTokenCount'] ?? 0,
                ],
            ];

            $tracer->updateRun($runId, $output);

            return $output;
        } catch (Exception $e) {
            $message = str_replace($this->apiKey, '***HIDDEN***', $e->getMessage());
            Log::error('Gemini generateMultimedia HTTP error: '.$message);
            $tracer->updateRun($runId, [], $e);
            throw $e;
        }
    }
}
