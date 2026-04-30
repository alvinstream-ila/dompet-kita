<?php

namespace App\Providers;

use App\Models\Asset;
use App\Models\GoalTransaction;
use App\Models\HolidayTransaction;
use App\Models\Loan;
use App\Models\Transaction;
use App\Observers\AssetObserver;
use App\Observers\GoalTransactionObserver;
use App\Observers\HolidayTransactionObserver;
use App\Observers\LoanObserver;
use App\Observers\TransactionObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    #[\Override]
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

        // Sovereign Consciousness Log (Only in HTTP mode to avoid CLI tool interference)
        if (! $this->app->runningInConsole()) {
            Log::info('Sovereign CFO v7.1.18: Core system initialized and operational.');
        }
    }

    /**
     * Register Model Observers.
     */
    private function bootObservers(): void
    {
        Transaction::observe(TransactionObserver::class);
        Asset::observe(AssetObserver::class);
        Loan::observe(LoanObserver::class);
        GoalTransaction::observe(GoalTransactionObserver::class);
        HolidayTransaction::observe(HolidayTransactionObserver::class);
    }

    /**
     * Register API Rate Limiters.
     */
    private function bootRateLimiters(): void
    {
        $this->bootGeneralRateLimiters();
        $this->bootAiRateLimiters();
    }

    private function bootGeneralRateLimiters(): void
    {
        RateLimiter::for('api', fn (Request $request): Limit => Limit::perMinute(60)->by($this->getRateLimitKey($request)));

        RateLimiter::for('media-upload', fn (Request $request): Limit => Limit::perMinute(5)->by($this->getRateLimitKey($request)));
    }

    private function bootAiRateLimiters(): void
    {
        RateLimiter::for('ai-insight', fn (Request $request): array => [
            Limit::perMinute(10)->by($this->getRateLimitKey($request)),
            Limit::perDay(100)->by($this->getRateLimitKey($request)),
        ]);

        RateLimiter::for('ai-chat', fn (Request $request): array => [
            Limit::perMinute(10)->by($this->getRateLimitKey($request)),
            Limit::perDay(50)->by($this->getRateLimitKey($request)),
        ]);

        RateLimiter::for('ai-scan', fn (Request $request): array => [
            Limit::perMinute(3)->by($this->getRateLimitKey($request)),
            Limit::perDay(30)->by($this->getRateLimitKey($request)),
        ]);
    }

    /**
     * Get a consistent rate limit key.
     */
    private function getRateLimitKey(Request $request): string
    {
        return (string) ($request->user()?->getAuthIdentifier() ?: $request->ip());
    }

    /**
     * Configure Production Security Guards.
     */
    private function bootSecurityGuards(): void
    {
        $appUrl = (string) config('app.url', '');
        $isSecure = str_starts_with($appUrl, 'https://');

        // Only enforce production security guards if in production and NOT in testing
        if (($this->app->environment('production') || $isSecure) && ! $this->app->environment('testing')) {
            config(['logging.channels.stack.level' => 'info']);
            URL::forceScheme('https');
            if ($appUrl) {
                URL::useOrigin($appUrl);
            }
        }

        // Configure Global HTTP Client Defaults
        Http::globalOptions([
            'timeout' => 30,
            'connect_timeout' => 10,
            'headers' => [
                'User-Agent' => 'DompetKita-Core/1.0',
            ],
        ]);
    }
}
