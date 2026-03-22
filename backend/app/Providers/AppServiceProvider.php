<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Bridge\Google\Transport\GmailSmtpTransport;
use Google\Client as GoogleClient;

class AppServiceProvider extends ServiceProvider
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
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });
        \Illuminate\Support\Facades\Log::info('Sayang, ini sistem update terbaru V2026!');
        // Production Security Guard
        // Register Google Mail Transport (OAuth2)
        Mail::extend('google', function (array $config) {
            $client = new GoogleClient();
            $client->setClientId($config['client_id']);
            $client->setClientSecret($config['client_secret']);
            $client->refreshToken($config['refresh_token']);
            
            $accessTokenResponse = $client->getAccessToken();
            $accessToken = $accessTokenResponse['access_token'];

            // We use GmailSmtpTransport but pass the Access Token as the password
            // for the XOAuth2 mechanism which is supported by Gmail SMTP.
            // Using config values to prevent connection timeouts if certain ports are blocked.
            return new GmailSmtpTransport(
                config('mail.from.address'),
                $accessToken,
                config('mail.mailers.smtp.host', 'smtp.gmail.com'),
                config('mail.mailers.smtp.port', 587),
                config('mail.mailers.smtp.encryption') === 'ssl' ? true : false
            );
        });

        // Force 'Dompet Kita' Branding for Mail
        config(['mail.from.name' => 'Dompet Kita']);

        // Mask sensitive data in case of unexpected exposure
        if (app()->environment('production') || str_starts_with(config('app.url'), 'https://')) {
            config(['logging.channels.stack.level' => 'info']);
            URL::forceScheme('https');
            URL::forceRootUrl(config('app.url'));
        }
    }
}
