<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class UnkeyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Verifies the x-api-key header against Unkey.dev to ensure
     * that only authorized frontend clients can access the backend.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('x-api-key');
        $response = null;

        if (! $key) {
            $response = $this->errorResponse('Sayang, kunci gerbangnya mana? (API Key missing) 🌸', 401);
        } else {
            try {
                $unkeyRes = Http::withHeaders(['Content-Type' => 'application/json'])
                    ->post('https://api.unkey.dev/v1/keys.verifyKey', [
                        'key' => $key,
                        'apiId' => config('services.unkey.api_id'),
                    ]);

                if ($unkeyRes->failed()) {
                    Log::error('UNKEY_VERIFICATION_FAILED', ['status' => $unkeyRes->status()]);
                    $response = $this->errorResponse('Aduh, kunci gerbangnya macet nih. Coba lagi ya! 🥺', 500);
                } else {
                    $data = $unkeyRes->json();
                    if (! ($data['valid'] ?? false)) {
                        $response = $this->errorResponse(
                            'Waduh Sayang, kunci kamu nggak cocok nih.. 🔐',
                            401,
                            (string) ($data['code'] ?? 'INVALID_KEY')
                        );
                    } else {
                        $request->merge(['unkey_meta' => $data['meta'] ?? []]);
                        $response = $next($request);
                    }
                }
            } catch (\Exception $e) {
                Log::critical('UNKEY_CRITICAL_ERROR', ['error' => $e->getMessage()]);
                $response = $this->errorResponse('Sayang, sistem kuncinya lagi istirahat sebentar nih.. 🥺', 500);
            }
        }

        return $response;
    }

    /**
     * Format a standardized JSON error response.
     */
    private function errorResponse(string $message, int $status, ?string $reason = null): Response
    {
        $payload = [
            'message' => $message,
            'success' => false,
        ];

        if ($reason) {
            $payload['reason'] = $reason;
        }

        return response()->json($payload, $status);
    }
}
