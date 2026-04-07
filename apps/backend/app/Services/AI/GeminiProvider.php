<?php

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
        $this->apiKey = \config('services.gemini.key');
    }

    public function getName(): string
    {
        return 'Gemini';
    }

    public function isAvailable(): bool
    {
        return ! empty($this->apiKey);
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

            return [
                'text' => $response->text(),
                'usage' => [
                    'prompt_tokens' => $response->usageMetadata->promptTokenCount ?? 0,
                    'completion_tokens' => $response->usageMetadata->candidatesTokenCount ?? 0,
                    'total_tokens' => $response->usageMetadata->totalTokenCount ?? 0,
                ],
            ];
        } catch (Exception $e) {
            Log::error('Gemini generateText error: '.$e->getMessage());
            throw $e;
        }
    }

    public function generateFromImage(string $prompt, string $base64Image, string $mimeType): array
    {
        return $this->generateWithMultimedia($prompt, $base64Image, $mimeType);
    }

    public function generateFromAudio(string $prompt, string $base64Audio, string $mimeType): array
    {
        return $this->generateWithMultimedia($prompt, $base64Audio, $mimeType);
    }

    /**
     * Common helper for multimedia (image/audio) generation.
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

            $data = $response->json();
            $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
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
