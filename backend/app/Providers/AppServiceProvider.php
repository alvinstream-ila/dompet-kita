<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport;
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

            // We use EsmtpTransport to allow custom ports (like 587) because GmailSmtpTransport 
            // is unfortunately hardcoded to port 465 which is often blocked in cloud environments.
            $transport = new EsmtpTransport(
                config('mail.mailers.smtp.host', 'smtp.gmail.com'),
                config('mail.mailers.smtp.port', 587),
                config('mail.mailers.smtp.encryption') === 'ssl' ? true : false
            );
            $transport->setUsername(config('mail.from.address'));
            $transport->setPassword($accessToken);

            return $transport;
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
