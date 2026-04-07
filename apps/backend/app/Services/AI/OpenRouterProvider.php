<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenRouterProvider implements AiProviderInterface
{
    protected string $apiKey;

    protected string $modelText;

    protected string $modelVision;

    protected string $baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

    public function __construct()
    {
        $this->apiKey = \config('services.ai.openrouter.key');
        $this->modelText = \config('services.ai.openrouter.model_text');
        $this->modelVision = \config('services.ai.openrouter.model_vision');

        // Override with the smart auto-router
        if (str_contains($this->modelVision, 'gemini') || str_contains($this->modelVision, 'llama-3.2-11b') || empty($this->modelVision)) {
            $this->modelVision = 'openrouter/free';
        }
    }

    public function getName(): string
    {
        return 'OpenRouter';
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
        return false; // OpenRouter audio support depends on specific models, not implemented yet.
    }

    public function generateText(string $prompt): array
    {
        try {
            $response = Http::withToken($this->apiKey)
                ->withHeaders([
                    'HTTP-Referer' => \config('app.url', 'https://dompetkita.id'),
                    'X-Title' => 'Dompet Kita',
                ])
                ->post($this->baseUrl, [
                    'model' => $this->modelText,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.1,
                ]);

            if ($response->failed()) {
                throw new \Exception('OpenRouter Text API Error: '.$response->body());
            }

            return [
                'text' => $response->json('choices.0.message.content') ?? '',
                'usage' => [
                    'prompt_tokens' => $response->json('usage.prompt_tokens', 0),
                    'completion_tokens' => $response->json('usage.completion_tokens', 0),
                    'total_tokens' => $response->json('usage.total_tokens', 0),
                ],
            ];
        } catch (\Exception $e) {
            Log::error('OpenRouter generateText error: '.$e->getMessage());
            throw $e;
        }
    }

    public function generateFromImage(string $prompt, string $base64Image, string $mimeType): array
    {
        try {
            $response = Http::withToken($this->apiKey)
                ->withHeaders([
                    'HTTP-Referer' => \config('app.url', 'https://dompetkita.id'),
                    'X-Title' => 'Dompet Kita',
                ])
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
                throw new \Exception('OpenRouter Vision API Error: '.$response->body());
            }

            return [
                'text' => $response->json('choices.0.message.content') ?? '',
                'usage' => [
                    'prompt_tokens' => $response->json('usage.prompt_tokens', 0),
                    'completion_tokens' => $response->json('usage.completion_tokens', 0),
                    'total_tokens' => $response->json('usage.total_tokens', 0),
                ],
            ];
        } catch (\Exception $e) {
            Log::error('OpenRouter generateFromImage error: '.$e->getMessage());
            throw $e;
        }
    }

    public function generateFromAudio(string $prompt, string $base64Audio, string $mimeType): array
    {
        throw new \Exception('Audio/Voice processing is handled by Gemini provider.');
    }
}
