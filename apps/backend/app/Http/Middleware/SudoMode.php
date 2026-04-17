<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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
            $lastSudoAt = Cache::get("sudo_mode_{$user->id}");

            if (! $lastSudoAt || now()->diffInMinutes((string) $lastSudoAt) > 15) {
                return $request->expectsJson()
                    ? response()->json([
                        'message' => 'Aduh Sayang, butuh konfirmasi ulang nih buat aksi penting ini. Re-auth dulu ya! 🔐',
                        'sudo_required' => true,
                    ], 403)
                    : redirect()->route('sudo.confirm');
            }
        }

        return $next($request);
    }
}
