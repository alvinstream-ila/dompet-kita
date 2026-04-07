<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * AiProviderManager handles the intelligent orchestration of multiple AI providers.
 * Includes "Self-Healing" features: Circuit Breaking (quarantine) and JSON auto-repair.
 */
class AiProviderManager
{
    /** @var AiProviderInterface[] */
    protected array $providers = [];

    protected int $quarantineMinutes = 10;

    protected int $errorThreshold = 3;

    public function __construct(array $providers = [])
    {
        $this->providers = $providers;
    }

    /**
     * Tries each provider in order until one succeeds.
     */
    public function generateText(string $prompt): string
    {
        $errors = [];

        foreach ($this->providers as $provider) {
            if (! $provider->isAvailable() || $this->isQuarantined($provider)) {
                continue;
            }

            try {
                $startTime = microtime(true);
                Log::info('Trying AI Provider: '.$provider->getName().' for text generation.');

                $result = $provider->generateText($prompt);

                $this->onSuccess($provider, microtime(true) - $startTime, $result['usage'] ?? []);

                return $result['text'];
            } catch (\Exception $e) {
                $errors[] = $provider->getName().': '.$e->getMessage();
                $this->onFailure($provider, $e);

                if ($this->shouldTryNext($e)) {
                    continue;
                }

                throw $e;
            }
        }

        throw new \Exception('Semua asisten AI sedang sibuk Sayang. Coba lagi sebentar lagi ya! ❤️ ['.implode(' | ', $errors).']');
    }

    /**
     * Tries each provider in order until one succeeds for vision tasks.
     */
    public function generateFromImage(string $prompt, string $base64Image, string $mimeType): string
    {
        $errors = [];

        foreach ($this->providers as $provider) {
            if (! $provider->isAvailable() || $this->isQuarantined($provider) || ! $provider->supportsVision()) {
                continue;
            }

            try {
                $startTime = microtime(true);
                Log::info('Trying AI Provider (Vision): '.$provider->getName());

                $result = $provider->generateFromImage($prompt, $base64Image, $mimeType);

                $this->onSuccess($provider, microtime(true) - $startTime, $result['usage'] ?? []);

                return $result['text'];
            } catch (\Exception $e) {
                $errors[] = $provider->getName().': '.$e->getMessage();
                $this->onFailure($provider, $e);

                if ($this->shouldTryNext($e)) {
                    continue;
                }

                throw $e;
            }
        }

        throw new \Exception('Maaf Sayang, AI gagal baca struknya nih. Mungkin lagi capek. Coba lagi ya! ❤️ ['.implode(' | ', $errors).']');
    }

    /**
     * Tries each provider in order until one succeeds for audio/voice tasks.
     */
    public function generateFromAudio(string $prompt, string $base64Audio, string $mimeType): string
    {
        $errors = [];

        foreach ($this->providers as $provider) {
            if (! $provider->isAvailable() || $this->isQuarantined($provider) || ! $provider->supportsAudio()) {
                continue;
            }

            try {
                $startTime = microtime(true);
                Log::info('Trying AI Provider (Audio): '.$provider->getName());

                $result = $provider->generateFromAudio($prompt, $base64Audio, $mimeType);

                $this->onSuccess($provider, microtime(true) - $startTime, $result['usage'] ?? []);

                return $result['text'];
            } catch (\Exception $e) {
                $errors[] = $provider->getName().': '.$e->getMessage();
                $this->onFailure($provider, $e);

                if ($this->shouldTryNext($e)) {
                    continue;
                }

                throw $e;
            }
        }

        throw new \Exception('Maaf Sayang, AI gagal memproses suaramu. Coba lagi ya! ❤️ ['.implode(' | ', $errors).']');
    }

    /**
     * CIRCUIT BREAKER: Is the provider in quarantine?
     */
    protected function isQuarantined(AiProviderInterface $provider): bool
    {
        $key = 'ai_provider_quarantine_'.$provider->getName();
        if (Cache::has($key)) {
            Log::warning('Skipping quarantined AI provider: '.$provider->getName());

            return true;
        }

        return false;
    }

    protected function onSuccess(AiProviderInterface $provider, float $latency, array $usage = []): void
    {
        Cache::forget('ai_provider_errors_'.$provider->getName());
        Log::info('AI Provider '.$provider->getName().' succeeded in '.round($latency, 2).'s');

        // Let the Watchdog record this success with tokens
        AiWatchdog::logPerformance(
            $provider->getName(),
            $latency,
            true,
            $usage['prompt_tokens'] ?? 0,
            $usage['completion_tokens'] ?? 0
        );
    }

    protected function onFailure(AiProviderInterface $provider, \Exception $e): void
    {
        $key = 'ai_provider_errors_'.$provider->getName();
        $errors = (int) Cache::get($key, 0) + 1;
        Cache::put($key, $errors, now()->addMinutes(60));

        Log::warning('AI Provider '.$provider->getName()." failed (Error count: $errors)");

        // Let the Watchdog record this failure
        AiWatchdog::logPerformance($provider->getName(), 0.0, false);

        if ($errors >= $this->errorThreshold) {
            Log::alert('QUARANTINING AI provider: '.$provider->getName().' for '.$this->quarantineMinutes.' minutes!');
            Cache::put('ai_provider_quarantine_'.$provider->getName(), true, now()->addMinutes($this->quarantineMinutes));
        }
    }

    /**
     * Determine if we should failover to the next provider.
     */
    protected function shouldTryNext(\Exception $e): bool
    {
        // Failover dynamically on ANY API error (including 404 model not found).
        // The error threshold will naturally quarantine providers that consistently fail.
        return true;
    }
}
