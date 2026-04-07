<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

class SocialAuthController extends Controller
{
    /**
     * Redirect to social provider auth page.
     */
    public function redirectToProvider(string $provider): RedirectResponse
    {
        /** @var AbstractProvider $driver */
        $driver = Socialite::driver($provider);

        return $driver->stateless()->redirect();
    }

    /**
     * Handle provider authentication callback.
     */
    public function handleProviderCallback(string $provider): RedirectResponse|JsonResponse
    {
        try {
            /** @var AbstractProvider $driver */
            $driver = Socialite::driver($provider);
            $socialUser = $driver->stateless()->user();
            $user = User::where('email', $socialUser->getEmail())->first();
        } catch (Exception $e) {
            return \response()->json([
                'status' => 'error',
                'message' => 'Gagal login lewat '.ucfirst($provider).' nih sayang, coba lagi ya? 🥺',
            ], 400);
        }

        try {
            if ($user) {
                // Update User for existing account
                $user->update([
                    'social_id' => $socialUser->getId(),
                    'social_type' => $provider,
                    'avatar_url' => $user->avatar_url ?? $socialUser->getAvatar(),
                    'email_verified_at' => $user->email_verified_at ?? \now(),
                ]);
            } else {
                // Create New User
                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                    'email' => $socialUser->getEmail(),
                    'social_id' => $socialUser->getId(),
                    'social_type' => $provider,
                    'avatar_url' => $socialUser->getAvatar(),
                    'password' => null,
                    'email_verified_at' => \now(),
                ]);

                // New User - this triggers events like SendEmailVerificationNotification
                try {
                    event(new Registered($user));
                } catch (Exception $e) {
                    Log::error('Event Registered failed: '.$e->getMessage());
                    // Don't fail the whole login just because of an email error
                }
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect to Frontend callback route
            $frontendUrl = \config('app.frontend_url', 'https://dompet-kita-six.vercel.app');
            $callbackUrl = rtrim($frontendUrl, '/').'/auth/callback?token='.$token;

            Log::info('Social login SUCCESS for '.$user->email);

            return \redirect()->away($callbackUrl);
        } catch (Exception $e) {
            Log::error('FAIL during handleProviderCallback logic: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return \response()->json([
                'status' => 'error',
                'message' => 'Waduh, ada masalah teknis pas nyimpen data kamu nih sayang. 🥺 '.$e->getMessage(),
            ], 500);
        }
    }
}
