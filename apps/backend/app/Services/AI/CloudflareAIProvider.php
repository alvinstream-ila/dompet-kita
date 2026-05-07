<?php

declare(strict_types=1);

namespace App\Services\AI;

use App\Exceptions\AiServiceException;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CloudflareAIProvider implements AiProviderInterface
{
    protected string $token;

    protected string $accountId;

    protected string $model;

    public function __construct()
    {
        $this->token = (string) config('services.ai.cloudflare.token');
        $this->accountId = (string) config('services.ai.cloudflare.account_id');
        $this->model = (string) config('services.ai.cloudflare.model', '@cf/meta/llama-3.2-11b-vision-instruct');
    }

    public function getName(): string
    {
        return 'cloudflare';
    }

    public function isAvailable(): bool
    {
        return ! empty($this->token) && ! empty($this->accountId) && $this->token !== '0';
    }

    public function supportsVision(): bool
    {
        return true;
    }

    public function supportsAudio(): bool
    {
        return false;
    }

    /**
     * @return array{text: string, usage: array{prompt_tokens: int, completion_tokens: int, total_tokens: int}}
     */
    public function generateText(string $prompt): array
    {
        // Use llama-3.1-8b-instruct for generic text tasks to save costs/latency
        $model = '@cf/meta/llama-3.1-8b-instruct';

        return $this->request($model, [
            'messages' => [
                ['role' => 'user', 'content' => $prompt],
            ],
        ]);
    }

    /**
     * @return array{text: string, usage: array{prompt_tokens: int, completion_tokens: int, total_tokens: int}}
     */
    public function generateFromImage(string $prompt, string $base64Image, string $mimeType): array
    {
        return $this->request($this->model, [
            'prompt' => $prompt,
            'image' => $base64Image,
        ]);
    }

    /**
     * @return array{text: string, usage: array{prompt_tokens: int, completion_tokens: int, total_tokens: int}}
     */
    public function generateFromAudio(string $prompt, string $base64Audio, string $mimeType): array
    {
        throw new AiServiceException('Cloudflare AI Provider does not support audio yet.');
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array{text: string, usage: array{prompt_tokens: int, completion_tokens: int, total_tokens: int}}
     */
    protected function request(string $model, array $payload): array
    {
        $url = "https://api.cloudflare.com/client/v4/accounts/{$this->accountId}/ai/run/{$model}";

        try {
            $response = Http::timeout(120)
                ->withToken($this->token)
                ->post($url, $payload);

            if (! $response->successful()) {
                throw new AiServiceException('Cloudflare AI API Error: '.$response->body());
            }

            /** @var array{result: array{response: string, usage?: array{prompt_tokens: int, completion_tokens: int}}} $data */
            $data = $response->json();
            $result = $data['result'] ?? [];

            $promptTokens = $result['usage']['prompt_tokens'] ?? 0;
            $completionTokens = $result['usage']['completion_tokens'] ?? 0;

            $responseContent = $result['response'] ?? '';
            if (is_array($responseContent)) {
                $responseContent = json_encode($responseContent);
            }

            return [
                'text' => (string) $responseContent,
                'usage' => [
                    'prompt_tokens' => $promptTokens,
                    'completion_tokens' => $completionTokens,
                    'total_tokens' => $promptTokens + $completionTokens,
                ],
            ];
        } catch (Exception $e) {
            $message = str_replace([$this->token, $this->accountId], '***HIDDEN***', $e->getMessage());
            Log::error('Cloudflare AI Provider Error: '.$message);
            throw $e;
        }
    }
}
