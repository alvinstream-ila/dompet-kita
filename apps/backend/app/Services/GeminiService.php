<?php

namespace App\Services;

use App\Services\AI\AiProviderManager;
use Illuminate\Support\Facades\Log;

/**
 * GeminiService: High-level AI interface for Dompet Kita.
 * Acts as a facade for the AiProviderManager to ensure consistent persona and error handling.
 */
class GeminiService
{
    public function __construct(
        protected AiProviderManager $manager
    ) {}

    /**
     * General text generation for financial analysis.
     */
    public function analyzeFinancials(string $prompt): string
    {
        return $this->generateText($prompt);
    }

    /**
     * Standard text generation with persona-aligned error handling.
     */
    public function generateText(string $prompt): string
    {
        try {
            return $this->manager->generateText($prompt);
        } catch (\Exception $e) {
            Log::error('AI Service Exception (GeminiService): ' . $e->getMessage());

            return 'Aduh Sayang, ada kendala pas aku lagi mikir tadi (AI Error). Coba tanya lagi beberapa saat lagi ya? ❤️';
        }
    }
}
