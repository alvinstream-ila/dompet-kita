<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\ResetPasswordOTPNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function sendResetLinkEmail(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', (string) $request->string('email'))->first();

        if (! $user instanceof User) {
            // Secure approach: still return success to hide user existence
            return response()->json(['message' => 'Tautan pemulihan kata sandi telah dikirim ke alamat email Anda.']);
        }

        // Generate 6-digit OTP
        $code = (string) random_int(100000, 999999);

        // Update user with hashed OTP and 15-minute expiry
        $user->update([
            'otp_reset_code' => Hash::make($code),
            'otp_reset_expires_at' => now()->addMinutes(15),
        ]);

        // Send Notification with plain code
        $user->notify(new ResetPasswordOTPNotification($code));

        Log::info('Sent Premium OTP Reset to: '.$request->string('email'));

        return response()->json(['message' => 'Kode pemulihan kata sandi telah dikirim ke alamat email Anda.']);
    }

    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::where('email', (string) $request->string('email'))->first();

        if (! $user instanceof User) {
            return response()->json([
                'message' => 'Kode pemulihan tidak valid atau telah kedaluwarsa.',
            ], 400);
        }

        $expiresAt = $user->otp_reset_expires_at;
        if (! $expiresAt || now()->greaterThan($expiresAt) || ! Hash::check((string) $request->string('code'), (string) $user->otp_reset_code)) {
            return response()->json([
                'message' => 'Kode pemulihan tidak valid atau telah kedaluwarsa. Silakan ajukan permintaan baru.',
            ], 400);
        }

        // Update password and clear OTP
        $user->forceFill([
            'password' => Hash::make((string) $request->string('password')),
            'otp_reset_code' => null,
            'otp_reset_expires_at' => null,
        ])->setRememberToken(Str::random(60));

        $user->save();

        event(new PasswordReset($user));

        return response()->json(['message' => 'Kata sandi Anda berhasil diperbarui. Silakan login kembali dengan kata sandi baru.']);
    }
}
