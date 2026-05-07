<?php

declare(strict_types=1);

namespace App\Services\AI;

use Illuminate\Support\Facades\Log;

class OCRService
{
    public function __construct(protected AiProviderManager $ai) {}

    /**
     * Scans a receipt image and extracts structured data.
     *
     * @return array{date: ?string, amount: float, vendor: ?string, currency: string}
     */
    public function scanReceipt(string $base64Image, string $mimeType): array
    {
        $prompt = <<<'PROMPT'
        Analyze this receipt image and output ONLY a raw JSON object.
        NO CONVERSATION, NO EXPLANATION, NO MARKDOWN.
        Just the JSON object itself.

        JSON structure:
        {
          "date": "YYYY-MM-DD" or null,
          "amount": number,
          "vendor": "Name" or null,
          "currency": "Code" (default IDR)
        }

        Find the total amount (look for TOTAL, GRAND TOTAL, or largest amount).
        PROMPT;

        $result = $this->emptyResult();

        try {
            $text = $this->ai->generateFromImage($prompt, $base64Image, $mimeType);

            // More robust JSON extraction: find the first { and last }
            $startPos = strpos($text, '{');
            $endPos = strrpos($text, '}');

            if ($startPos !== false && $endPos !== false) {
                $json = substr($text, $startPos, $endPos - $startPos + 1);
                $json = trim($json);

                /** @var array{date?: ?string, amount?: int|float, vendor?: ?string, currency?: string} $data */
                $data = json_decode($json, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    $result = [
                        'date' => $data['date'] ?? null,
                        'amount' => (float) ($data['amount'] ?? 0),
                        'vendor' => $data['vendor'] ?? null,
                        'currency' => $data['currency'] ?? 'IDR',
                    ];
                } else {
                    Log::warning('OCR Service: Failed to parse AI JSON response', ['response' => $text]);
                }
            } else {
                Log::warning('OCR Service: No JSON found in response', ['response' => $text]);
            }
        } catch (\Exception $e) {
            Log::error('OCR Service Error: '.$e->getMessage());
        }

        return $result;
    }

    /**
     * @return array{date: null, amount: float, vendor: null, currency: string}
     */
    protected function emptyResult(): array
    {
        return [
            'date' => null,
            'amount' => 0.0,
            'vendor' => null,
            'currency' => 'IDR',
        ];
    }
}
