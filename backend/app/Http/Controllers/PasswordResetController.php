<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;

class PasswordResetController extends Controller
{
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        // We'll use Laravel's built-in password broker
        $status = Password::sendResetLink(
            $request->only('email')
        );

        \Illuminate\Support\Facades\Log::info('Password Reset Status: ' . $status . ' for email: ' . $request->email);

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Link reset password sudah dikirim ke email kamu, Sayang! ❤️'])
            : response()->json(['message' => __($status) . ' (Status: ' . $status . ')'], 400);
    }

    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Password kamu sudah berhasil diganti! Sekarang coba login ya sayang! ✨'])
            : response()->json(['message' => 'Token atau emailnya nggak pas nih sayang, coba minta link baru ya? 🥺'], 400);
    }
}
