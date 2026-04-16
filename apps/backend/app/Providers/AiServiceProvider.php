<?php

namespace App\Providers;

use App\Services\AI\AiProviderManager;
use App\Services\AI\GeminiProvider;
use App\Services\AI\GroqProvider;
use App\Services\AI\OpenRouterProvider;
use App\Services\Cfo\QuantumInsightEngine;
use Illuminate\Support\ServiceProvider;

class AiServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->singleton(AiProviderManager::class, function (): AiProviderManager {
            // Priority order: Groq (Primary) → OpenRouter (Fallback) → Gemini (Emergency)
            return new AiProviderManager([
                new GroqProvider,
                new OpenRouterProvider,
                new GeminiProvider,
            ]);
        });

        $this->app->singleton(QuantumInsightEngine::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void {}
}
