<?php

declare(strict_types=1);

namespace App\Services\AI;

interface AiProviderInterface
{
    public function getName(): string;

    /**
     * @return array{text: string, usage: array{prompt_tokens: int, completion_tokens: int, total_tokens: int}}
     */
    public function generateText(string $prompt): array;

    /**
     * @return array{text: string, usage: array{prompt_tokens: int, completion_tokens: int, total_tokens: int}}
     */
    public function generateFromImage(string $prompt, string $base64Image, string $mimeType): array;

    /**
     * @return array{text: string, usage: array{prompt_tokens: int, completion_tokens: int, total_tokens: int}}
     */
    public function generateFromAudio(string $prompt, string $base64Audio, string $mimeType): array;

    public function isAvailable(): bool;

    public function supportsVision(): bool;

    public function supportsAudio(): bool;
}
