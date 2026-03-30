<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

class SocialAuthController extends Controller
{
    /**
     * Redirect to social provider auth page.
     * 
     * @param string $provider
     * @return RedirectResponse
     */
    public function redirectToProvider(string $provider): RedirectResponse
    {
        /** @var AbstractProvider $driver */
        $driver = Socialite::driver($provider);

        return $driver->stateless()->redirect();
    }

    /**
     * Handle provider authentication callback.
     * 
     * @param string $provider
     * @return RedirectResponse|JsonResponse
     */
    public function handleProviderCallback(string $provider): RedirectResponse|JsonResponse
    {
        try {
            /** @var AbstractProvider $driver */
            $driver = Socialite::driver($provider);
            $socialUser = $driver->stateless()->user();
        } catch (Exception $e) {
            return \response()->json([
                'status' => 'error',
                'message' => 'Gagal login lewat '.ucfirst($provider).' nih sayang, coba lagi ya? 🥺'
            ], 400);
        }

        $user = User::where('email', $socialUser->getEmail())->first();

        // Update or Create User
        if ($user) {
            $user->update([
                'social_id' => $socialUser->getId(),
                'social_type' => $provider,
                'avatar_url' => $user->avatar_url ?? $socialUser->getAvatar(),
                'email_verified_at' => $user->email_verified_at ?? \now(),
            ]);
        } else {
            $user = User::create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                'email' => $socialUser->getEmail(),
                'social_id' => $socialUser->getId(),
                'social_type' => $provider,
                'avatar_url' => $socialUser->getAvatar(),
                'password' => null,
                'email_verified_at' => \now(),
            ]);

            \event(new Registered($user));
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Redirect to Frontend callback route
        $frontendUrl = \config('app.frontend_url', 'http://localhost:5173');
        $callbackUrl = rtrim($frontendUrl, '/') . '/auth/callback?token=' . $token;

        return \redirect()->away($callbackUrl);
    }
}
