<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Auth;
use Exception;

class SocialAuthController extends Controller
{
    public function redirectToProvider($provider)
    {
        /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
        $driver = Socialite::driver($provider);
        return $driver->stateless()->redirect();
    }

    public function handleProviderCallback($provider)
    {
        try {
            /** @var \Laravel\Socialite\Two\AbstractProvider $driver */
            $driver = Socialite::driver($provider);
            $socialUser = $driver->stateless()->user();
        } catch (Exception $e) {
            return response()->json(['message' => 'Gagal login lewat ' . ucfirst($provider) . ' nih sayang, coba lagi ya? 🥺'], 400);
        }

        $user = User::where('email', $socialUser->getEmail())->first();

        if ($user) {
            $user->update([
                'social_id' => $socialUser->getId(),
                'social_type' => $provider,
                'avatar_url' => $user->avatar_url ?? $socialUser->getAvatar(),
            ]);
        } else {
            $user = User::create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname(),
                'email' => $socialUser->getEmail(),
                'social_id' => $socialUser->getId(),
                'social_type' => $provider,
                'avatar_url' => $socialUser->getAvatar(),
                'password' => null, // No password for social login users
            ]);
            
            event(new \Illuminate\Auth\Events\Registered($user));
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Since this is a JSON API, we typically redirect back to the frontend with the token
        // Or return JSON if handled via popups. 
        // For simple integration, let's redirect to a frontend URL that handles the token.
        $frontendUrl = config('app.frontend_url') ?? 'http://localhost:5173';
        
        return redirect()->away($frontendUrl . '/auth/callback?token=' . $token);
    }
}
