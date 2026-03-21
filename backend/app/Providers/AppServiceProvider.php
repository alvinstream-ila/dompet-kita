<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;

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
        // Production Security Guard
        // if (app()->environment('production') && config('app.debug')) {
        //     abort(500, 'Security Breach V2: Application must not run in DEBUG mode in production.');
        // }

        // Mask sensitive data in case of unexpected exposure
        if (app()->environment('production')) {
            config(['logging.channels.stack.level' => 'info']);
        }
    }
}
