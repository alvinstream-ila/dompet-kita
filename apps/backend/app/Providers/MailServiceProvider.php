<?php

namespace App\Providers;

use App\Services\Security\GoogleMailTransport;
use Google\Client as GoogleClient;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;

class MailServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    #[\Override]
    public function register(): void {}

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Google Mail Transport (OAuth2 Over HTTP API to bypass Railway SMTP blocks)
        Mail::extend('google', function (array $config): GoogleMailTransport {
            $client = new GoogleClient;
            $client->setClientId($config['client_id']);
            $client->setClientSecret($config['client_secret']);

            // Fetch a fresh access token using the refresh token
            $accessTokenResponse = $client->fetchAccessTokenWithRefreshToken($config['refresh_token']);

            if (! isset($accessTokenResponse['access_token'])) {
                Log::error('GMAIL-AUTH-ERROR: Failed to retrieve access token.', [
                    'response' => $accessTokenResponse,
                ]);
                throw new \RuntimeException('Failed to retrieve Gmail access token. Check GOOGLE_MAIL_REFRESH_TOKEN.');
            }

            return new GoogleMailTransport($accessTokenResponse['access_token']);
        });

        // Force 'Dompet Kita' Branding for Mail
        config(['mail.from.name' => 'Dompet Kita']);
    }
}
