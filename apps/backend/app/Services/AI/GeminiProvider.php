<?php

declare(strict_types=1);

namespace App\Services\AI;

use Exception;
use Gemini;
use Gemini\Data\UsageMetadata;
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
        try {
            $client = Gemini::client($this->apiKey);
            $response = $client->generativeModel($this->model)->generateContent($prompt);

            $usage = $response->usageMetadata;

            return [
                'text' => $response->text(),
                'usage' => [
                    'prompt_tokens' => (int) ($usage->promptTokenCount),
                    'completion_tokens' => (int) ($usage->candidatesTokenCount),
                    'total_tokens' => (int) ($usage->totalTokenCount),
                ],
            ];
        } catch (Exception $e) {
            Log::error('Gemini generateText error: '.$e->getMessage());
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

            $response = Http::timeout(120)->post($url, $payload);

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

            return [
                'text' => $text,
                'usage' => [
                    'prompt_tokens' => $usage['promptTokenCount'] ?? 0,
                    'completion_tokens' => $usage['candidatesTokenCount'] ?? 0,
                    'total_tokens' => $usage['totalTokenCount'] ?? 0,
                ],
            ];
        } catch (Exception $e) {
            Log::error('Gemini generateMultimedia HTTP error: '.$e->getMessage());
            throw $e;
        }
    }
}
