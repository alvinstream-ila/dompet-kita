<?php

namespace App\Http\Controllers;

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    public function sendResetLinkEmail(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user) {
            // Secure approach: still return success to hide user existence
            return response()->json(['message' => 'Link reset password sudah dikirim ke email kamu, Sayang! ❤️']);
        }

        // The sendPasswordResetNotification was already overridden in User model
        // Just call the default Laravel way or trigger it directly
        $user->sendPasswordResetNotification(Str::random(60)); // The token is irrelevant but standard

        Log::info('Sent Premium OTP Reset to: '.$request->email);

        return response()->json(['message' => 'Kode reset password sudah meluncur ke email kamu, Sayang! ❤️']);
    }

    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = \App\Models\User::where('email', $request->email)
            ->where('otp_reset_code', $request->code)
            ->first();

        if (!$user || now()->greaterThan($user->otp_reset_expires_at)) {
            return response()->json([
                'message' => 'Kode reset nggak pas atau sudah basi nih sayang, coba minta lagi ya? 🥺'
            ], 400);
        }

        // Update password and clear OTP
        $user->forceFill([
            'password' => Hash::make($request->password),
            'otp_reset_code' => null,
            'otp_reset_expires_at' => null,
        ])->setRememberToken(Str::random(60));

        $user->save();

        event(new PasswordReset($user));

        return response()->json(['message' => 'Password kamu sudah berhasil diganti! Sekarang coba login ya sayang! ✨']);
    }
}
