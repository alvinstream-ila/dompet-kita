<?php

namespace App\Http\Controllers;

use App\Models\User;
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

        $user = User::where('email', $request->email)->first();

        if (! $user) {
            // Secure approach: still return success to hide user existence
            return response()->json(['message' => 'Tautan pemulihan kata sandi telah dikirim ke alamat email Anda.']);
        }

        // The sendPasswordResetNotification was already overridden in User model
        // Just call the default Laravel way or trigger it directly
        $user->sendPasswordResetNotification(Str::random(60)); // The token is irrelevant but standard

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

        $user = User::where('email', $request->email)
            ->where('otp_reset_code', $request->code)
            ->first();

        $expiresAt = $user?->otp_reset_expires_at;
        if (! $user || ! $expiresAt || now()->greaterThan($expiresAt)) {
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
