<?php

namespace App\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    protected string $apiKey;

    protected string $baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
    }

    public function analyzeFinancials(string $prompt)
    {
        try {
            /** @var Response $response */
            $response = Http::post($this->baseUrl.'?key='.$this->apiKey, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
            ]);

            if ($response->successful()) {
                return $response->json()['candidates'][0]['content']['parts'][0]['text'] ?? 'Maaf Sayang, aku lagi bingung mau ngomong apa..';
            }

            Log::error('Gemini API Error: '.$response->body());

            return 'Gagal menghubungi Gemini AI.';
        } catch (\Exception $e) {
            Log::error('Gemini Service Exception: '.$e->getMessage());

            return 'Terjadi kesalahan sistem saat menghubungi AI.';
        }
    }
}
