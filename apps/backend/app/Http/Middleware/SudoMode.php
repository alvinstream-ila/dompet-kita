<?php

declare(strict_types=1);

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
            // 🛡️ The cache TTL (set to 15 min in AuthController::sudoConfirm) is the sole
            // expiry mechanism. If the key exists, sudo is still active. No addMinutes() check
            // is needed here — that was dead code since it could never be true while cache is alive.
            $sudoIsActive = Cache::has("sudo_mode_{$user->id}");

            if (! $sudoIsActive) {
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
