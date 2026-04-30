<?php

declare(strict_types=1);

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
        $apiKey = \config('services.ai.openrouter.key');
        $modelText = \config('services.ai.openrouter.model_text');
        $modelVision = \config('services.ai.openrouter.model_vision');

        $this->apiKey = is_string($apiKey) ? $apiKey : '';
        $this->modelText = is_string($modelText) ? $modelText : 'openai/gpt-3.5-turbo';
        $this->modelVision = is_string($modelVision) ? $modelVision : 'openai/gpt-4-vision-preview';

        // Override with the smart auto-router
        if (str_contains($this->modelVision, 'gemini') || str_contains($this->modelVision, 'llama-3.2-11b') || ($this->modelVision === '' || $this->modelVision === '0')) {
            $this->modelVision = 'openrouter/free';
        }
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
        try {
            $response = Http::withToken($this->apiKey)
                ->timeout(30)
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
                throw new \Exception('OpenRouter Text API Error ('.$response->status().'): '.$response->body());
            }

            $content = $response->json('choices.0.message.content');
            $promptTokens = $response->json('usage.prompt_tokens');
            $completionTokens = $response->json('usage.completion_tokens');
            $totalTokens = $response->json('usage.total_tokens');

            return [
                'text' => is_string($content) ? $content : '',
                'usage' => [
                    'prompt_tokens' => is_int($promptTokens) ? $promptTokens : 0,
                    'completion_tokens' => is_int($completionTokens) ? $completionTokens : 0,
                    'total_tokens' => is_int($totalTokens) ? $totalTokens : 0,
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
                ->timeout(30)
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
                throw new \Exception('OpenRouter Vision API Error ('.$response->status().'): '.$response->body());
            }

            $content = $response->json('choices.0.message.content');
            $promptTokens = $response->json('usage.prompt_tokens');
            $completionTokens = $response->json('usage.completion_tokens');
            $totalTokens = $response->json('usage.total_tokens');

            return [
                'text' => is_string($content) ? $content : '',
                'usage' => [
                    'prompt_tokens' => is_int($promptTokens) ? $promptTokens : 0,
                    'completion_tokens' => is_int($completionTokens) ? $completionTokens : 0,
                    'total_tokens' => is_int($totalTokens) ? $totalTokens : 0,
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
