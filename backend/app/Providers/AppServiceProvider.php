<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

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
        // Production Security Guard
        if (app()->environment('production') && config('app.debug')) {
            abort(500, 'Security Breach: Application must not run in DEBUG mode in production.');
        }

        // Mask sensitive data in case of unexpected exposure
        if (app()->environment('production')) {
            config(['logging.channels.stack.level' => 'info']);
        }
    }
}
