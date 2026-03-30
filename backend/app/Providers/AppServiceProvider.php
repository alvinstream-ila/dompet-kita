<?php

namespace App\Providers;

use Google\Client as GoogleClient;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\MessageConverter;

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
        Log::info('Sayang, ini sistem update terbaru V2026!');
        // Production Security Guard
        // Register Google Mail Transport (OAuth2 Over HTTP API to bypass Railway SMTP blocks)
        Mail::extend('google', function (array $config) {
            $client = new GoogleClient;
            $client->setClientId($config['client_id']);
            $client->setClientSecret($config['client_secret']);
            $client->refreshToken($config['refresh_token']);

            $accessTokenResponse = $client->getAccessToken();
            $accessToken = $accessTokenResponse['access_token'];

            return new class($accessToken) extends AbstractTransport
            {
                private $token;

                public function __construct($token)
                {
                    parent::__construct();
                    $this->token = $token;
                }

                protected function doSend(SentMessage $message): void
                {
                    $email = MessageConverter::toEmail($message->getOriginalMessage());
                    $rawMessage = rtrim(strtr(base64_encode($email->toString()), '+/', '-_'), '=');

                    /** @var Response $response */
                    $response = Http::withToken($this->token)
                        ->post('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', [
                            'raw' => $rawMessage,
                        ]);
                    if (! $response->successful()) {
                        throw new \Exception('Gmail HTTP API Error: '.$response->body());
                    }
                }

                public function __toString(): string
                {
                    return 'gmail-http';
                }
            };
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
