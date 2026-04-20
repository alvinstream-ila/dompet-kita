<?php

namespace App\Http\Controllers;

use App\Models\User;
use Exception;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\AbstractProvider;

class SocialAuthController extends Controller
{
    /**
     * Redirect to social provider auth page.
     */
    public function redirectToProvider(string $provider): RedirectResponse
    {
        if (empty(config("services.{$provider}.client_id"))) {
            Log::error("SocialAuth: Missing configuration for {$provider}. Check GOOGLE_CLIENT_ID in .env");

            $loginUrl = rtrim((string) config('app.frontend_url'), '/').'/auth/login?error=missing_config';

            return redirect()->away($loginUrl);
        }

        /** @var AbstractProvider $driver */
        $driver = Socialite::driver($provider);

        return $driver->stateless()->redirect();
    }

    /**
     * Handle provider authentication callback.
     */
    public function handleProviderCallback(string $provider): RedirectResponse
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        try {
            /** @var AbstractProvider $driver */
            $driver = Socialite::driver($provider);
            $socialUser = $driver->stateless()->user();
            $user = User::where('email', $socialUser->getEmail())->first();
        } catch (Exception $e) {
            Log::error("SocialAuth: Driver fetch failed for {$provider}: ".$e->getMessage());

            return redirect()->away($frontendUrl.'/auth/login?error=driver_fetch_failed');
        }

        try {
            $isNewUser = false;
            if ($user) {
                // Update User for existing account
                $user->update([
                    'social_id' => $socialUser->getId(),
                    'social_type' => $provider,
                    'avatar_url' => $user->avatar_url ?? $socialUser->getAvatar(),
                    'email_verified_at' => $user->email_verified_at ?? \now(),
                ]);
            } else {
                // Create New User with Unique Username
                $isNewUser = true;
                $sourceName = $socialUser->getName() ?? $socialUser->getNickname() ?? 'user';
                $username = $this->generateUniqueUsername((string) $sourceName);

                $user = User::create([
                    'name' => $username,
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
            $callbackUrl = $frontendUrl.'/auth/callback?token='.urlencode($token).($isNewUser ? '&is_new=1' : '');

            Log::info("SocialAuth: Login SUCCESS for {$user->email} via {$provider}");

            return redirect()->away($callbackUrl);
        } catch (Exception $e) {
            Log::error("SocialAuth: FAIL during callback logic for {$provider}: ".$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);

            return redirect()->away($frontendUrl.'/auth/login?error=callback_failed');
        }
    }

    /**
     * Generate a unique slugified username.
     */
    protected function generateUniqueUsername(string $name): string
    {
        $base = Str::slug($name, '-');

        // Handle empty slug (e.g. name is only non-latin characters)
        if (empty($base)) {
            $base = 'user';
        }

        $username = $base;
        $counter = 1;

        // Check for collisions
        while (User::where('name', $username)->exists()) {
            $username = $base.'-'.$counter;
            $counter++;
        }

        return $username;
    }
}
