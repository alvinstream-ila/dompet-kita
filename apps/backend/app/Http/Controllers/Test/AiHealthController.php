<?php

namespace App\Http\Controllers\Test;

use App\Http\Controllers\Controller;
use App\Services\AI\GeminiProvider;
use App\Services\AI\GroqProvider;
use App\Services\AI\OpenRouterProvider;
use Illuminate\Http\Request;

class AiHealthController extends Controller
{
    public function check(Request $request)
    {
        $results = [];

        $providers = [
            'Groq' => new GroqProvider,
            'OpenRouter' => new OpenRouterProvider,
            'Gemini' => new GeminiProvider,
        ];

        foreach ($providers as $name => $provider) {
            try {
                if (! $provider->isAvailable()) {
                    $results[$name] = [
                        'status' => 'Skipped',
                        'message' => 'API Key missing in config',
                    ];

                    continue;
                }

                $startTime = microtime(true);
                $response = $provider->generateText('Hello, this is a health check. Reply with "OK".');
                $duration = round(microtime(true) - $startTime, 2);

                $results[$name] = [
                    'status' => 'Success',
                    'response' => $response,
                    'duration' => $duration.'s',
                ];
            } catch (\Throwable $e) {
                $results[$name] = [
                    'status' => 'Failed',
                    'error' => $e->getMessage(),
                    'trace' => substr($e->getTraceAsString(), 0, 500),
                ];
            }
        }

        return response()->json([
            'timestamp' => now()->toDateTimeString(),
            'results' => $results,
        ]);
    }
}
