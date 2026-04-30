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
        RateLimiter::for('api', fn (Request $request): Limit => Limit::perMinute(60)->by($request->user()?->id ?: $request->ip()));

        // AI Feature Limits
        RateLimiter::for('ai-insight', fn (Request $request): array => [
            Limit::perMinute(10)->by($request->user()?->id ?: $request->ip()),
            Limit::perDay(100)->by($request->user()?->id ?: $request->ip()),
        ]);

        RateLimiter::for('ai-chat', fn (Request $request): array => [
            Limit::perMinute(10)->by($request->user()?->id ?: $request->ip()),
            Limit::perDay(50)->by($request->user()?->id ?: $request->ip()),
        ]);

        RateLimiter::for('ai-scan', fn (Request $request): array => [
            Limit::perMinute(3)->by($request->user()?->id ?: $request->ip()),
            Limit::perDay(30)->by($request->user()?->id ?: $request->ip()),
        ]);
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
            URL::forceRootUrl($appUrl ?: null);
        }
    }
}
