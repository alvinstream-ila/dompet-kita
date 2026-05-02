<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class SudoMode
{
    /**
     * Handle an incoming request.
     * Ensures user has verified their session in the last 15 minutes before critical actions.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user) {
            $token = $request->user()?->currentAccessToken();
            $tokenId = $token instanceof PersonalAccessToken ? $token->id : 'default';

            $fingerprint = sha1($request->ip().$request->userAgent());
            $storedFingerprint = Cache::get("sudo_mode_{$user->id}_{$tokenId}");

            if (! $storedFingerprint || $storedFingerprint !== $fingerprint) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'message' => 'Konfirmasi keamanan diperlukan untuk melanjutkan aksi ini. Silakan lakukan otentikasi ulang.',
                        'sudo_required' => true,
                    ], 403);
                }

                return abort(403, 'Sudo mode required.');
            }
        }

        return $next($request);
    }
}
