<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\Request;
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

        if ($user && method_exists($user, 'currentAccessToken')) {
            /** @var PersonalAccessToken|null $token */
            $token = $user->currentAccessToken();

            if (!$token) {
                return $next($request);
            }

            
            // 1. Absolute Timeout (Default: 24 Jam / 1440 Menit)
            $absoluteTimeout = config('sanctum.absolute_expiration', 1440);
            $createdAt = $token->created_at;
            
            if ($createdAt->addMinutes($absoluteTimeout)->isPast()) {
                $token->delete();
                throw new AuthenticationException('Aduh Sayang, sesi kamu sudah berakhir setelah 24 jam. Demi keamanan, login ulang dulu ya! ✨');
            }

            // 2. Idle Timeout / Sliding Window (Default: 30 Menit)
            $idleTimeout = config('sanctum.idle_expiration', 30);
            
            // Sanctum secara otomatis mengupdate last_used_at pada Guard::handle
            // Kita mengecek nilai sebelum request ini diproses lebih lanjut
            $lastUsedAt = $token->last_used_at ?? $createdAt;

            if ($lastUsedAt->addMinutes($idleTimeout)->isPast()) {
                $token->delete();
                throw new AuthenticationException('Sayang, kamu tadi ketiduran ya? Sesi kamu habis karena kelamaan nggak ada aktivitas. Login lagi yuk! 🌸');
            }
        }

        return $next($request);
    }
}
