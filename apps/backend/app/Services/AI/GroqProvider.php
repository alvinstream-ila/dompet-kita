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
        $this->apiKey = \config('services.ai.groq.key');
        $this->model = \config('services.ai.groq.model');
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
        try {
            $response = Http::withToken($this->apiKey)
                ->post($this->baseUrl, [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.1,
                ]);

            if ($response->failed()) {
                throw new \Exception('Groq API Error: '.$response->body());
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
            Log::error('Groq generateText error: '.$e->getMessage());
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
