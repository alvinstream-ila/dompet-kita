<?php

namespace App\Providers;

use App\Services\Security\GoogleMailTransport;
use Google\Client as GoogleClient;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;

class MailServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register Google Mail Transport (OAuth2 Over HTTP API to bypass Railway SMTP blocks)
        Mail::extend('google', function (array $config) {
            $client = new GoogleClient();
            $client->setClientId($config['client_id']);
            $client->setClientSecret($config['client_secret']);
            $client->refreshToken($config['refresh_token']);

            $accessTokenResponse = $client->getAccessToken();
            $accessToken = $accessTokenResponse['access_token'];

            return new GoogleMailTransport($accessToken);
        });

        // Force 'Dompet Kita' Branding for Mail
        config(['mail.from.name' => 'Dompet Kita']);
    }
}
