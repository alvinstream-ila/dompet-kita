<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class CheckSessionTimeout
{
    /**
     * Handle an incoming request.
     *
     * Implementasi "Sovereign Standard" Session Management:
     * 1. Idle Timeout: 30 Menit (Sliding Window via last_used_at)
     * 2. Absolute Timeout: 24 Jam (Via created_at)
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // CheckSessionTimeout is usually behind auth:sanctum, so user should exist.
        // PHPStan Level 9: User model (App\Models\User) already has currentAccessToken via HasApiTokens.
        if ($user) {
            /** @var PersonalAccessToken|null $token */
            $token = $user->currentAccessToken();

            if ($token instanceof PersonalAccessToken === false) {
                return $next($request);
            }

            // 1. Absolute Timeout (Default: 24 Jam / 1440 Menit)
            $absoluteTimeout = (int) config('sanctum.absolute_expiration', 1440);
            $createdAt = $token->created_at;

            if ($createdAt instanceof Carbon) {
                // Carbon is mutable/immutable depending on version/config, copy() is safer
                if ($createdAt->copy()->addMinutes($absoluteTimeout)->isPast()) {
                    $token->delete();
                    throw new AuthenticationException('Sesi Anda telah berakhir demi keamanan. Silakan login kembali.');
                }
            }

            // 2. Idle Timeout / Sliding Window (Default: 30 Menit)
            $idleTimeout = (int) config('sanctum.idle_expiration', 30);
            $lastUsedAt = $token->last_used_at ?? $createdAt;

            if ($lastUsedAt instanceof Carbon) {
                if ($lastUsedAt->copy()->addMinutes($idleTimeout)->isPast()) {
                    $token->delete();
                    throw new AuthenticationException('Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.');
                }
            }
        }

        return $next($request);
    }
}
