<?php

namespace App\Providers;

use App\Models\Transaction;
use App\Observers\TransactionObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // ── Firewall Autoload Patch ────────────────────────────────────────────
        // akaunting/laravel-firewall is installed but missing from the static
        // autoload map (vendor/composer/autoload_static.php) because composer
        // dump-autoload has not been run yet. We register the namespace manually
        // here so the Provider in bootstrap/providers.php can be resolved.
        // This can be removed after running `composer dump-autoload` on the server.
        spl_autoload_register(function (string $class): void {
            $prefix = 'Akaunting\\Firewall\\';
            $baseDir = base_path('vendor/akaunting/laravel-firewall/src/');
            if (str_starts_with($class, $prefix)) {
                $relative = str_replace('\\', '/', substr($class, strlen($prefix)));
                $file = $baseDir.$relative.'.php';
                if (file_exists($file)) {
                    require $file;
                }
            }
        }, prepend: true);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->bootObservers();
        $this->bootRateLimiters();
        $this->bootSecurityGuards();

        // Sovereign Consciousness Log
        Log::info('Sayang, sistem kognitif Dompet Kita v7.1.18 aktif dan siap membantu! ❤️');
    }

    /**
     * Register Model Observers.
     */
    private function bootObservers(): void
    {
        Transaction::observe(TransactionObserver::class);
    }

    /**
     * Register API Rate Limiters.
     */
    private function bootRateLimiters(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // AI Feature Limits
        RateLimiter::for('ai-insight', function (Request $request) {
            return [
                Limit::perMinute(10)->by($request->user()?->id ?: $request->ip()),
                Limit::perDay(100)->by($request->user()?->id ?: $request->ip()),
            ];
        });

        RateLimiter::for('ai-chat', function (Request $request) {
            return [
                Limit::perMinute(10)->by($request->user()?->id ?: $request->ip()),
                Limit::perDay(50)->by($request->user()?->id ?: $request->ip()),
            ];
        });

        RateLimiter::for('ai-scan', function (Request $request) {
            return [
                Limit::perMinute(3)->by($request->user()?->id ?: $request->ip()),
                Limit::perDay(30)->by($request->user()?->id ?: $request->ip()),
            ];
        });
    }

    /**
     * Configure Production Security Guards.
     */
    private function bootSecurityGuards(): void
    {
        $appUrl = (string) config('app.url', '');
        if ($this->app->environment('production') || str_starts_with($appUrl, 'https://')) {
            config(['logging.channels.stack.level' => 'info']);
            URL::forceScheme('https');
            URL::forceRootUrl($appUrl ? $appUrl : null);
        }
    }
}
