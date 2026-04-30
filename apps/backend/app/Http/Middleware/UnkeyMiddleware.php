<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
            $response = $this->errorResponse('Otentikasi gagal: API Key diperlukan.', 401);
        } else {
            try {
                $cacheKey = 'unkey_verify_'.md5($key);
                $data = Cache::remember($cacheKey, 300, function () use ($key) {
                    $unkeyRes = Http::withHeaders([
                        'Content-Type' => 'application/json',
                        'User-Agent' => 'DompetKita-Auth/1.0 (Unkey)',
                    ])
                        ->timeout(5)
                        ->retry(2, 100)
                        ->post('https://api.unkey.dev/v1/keys.verifyKey', [
                            'key' => $key,
                            'apiId' => config('services.unkey.api_id'),
                        ]);

                    if ($unkeyRes->failed()) {
                        return ['error' => true, 'status' => $unkeyRes->status()];
                    }

                    return $unkeyRes->json();
                });

                if (isset($data['error'])) {
                    Log::error('UNKEY_VERIFICATION_FAILED', ['status' => $data['status']]);
                    $response = $this->errorResponse('Terjadi kesalahan pada sistem otentikasi. Silakan coba lagi.', 500);
                } elseif (! ($data['valid'] ?? false)) {
                    $response = $this->errorResponse(
                        'Otentikasi gagal: API Key tidak valid.',
                        401,
                        (string) ($data['code'] ?? 'INVALID_KEY')
                    );
                } else {
                    $request->merge(['unkey_meta' => $data['meta'] ?? []]);
                    $response = $next($request);
                }
            } catch (\Exception $e) {
                Log::critical('UNKEY_CRITICAL_ERROR', ['error' => $e->getMessage()]);
                $response = $this->errorResponse('Layanan otentikasi sedang tidak tersedia.', 500);
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
