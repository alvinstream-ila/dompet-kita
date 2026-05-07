<?php

namespace App\Services\AI;

use App\Exceptions\AiServiceException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * AiProviderManager handles the intelligent orchestration of multiple AI providers.
 * Includes "Self-Healing" features: Circuit Breaking (quarantine) and JSON auto-repair.
 */
class AiProviderManager
{
    protected int $quarantineMinutes = 10;

    protected int $errorThreshold = 3;

    /**
     * @param  array<AiProviderInterface>  $providers
     */
    public function __construct(protected array $providers = []) {}

    /**
     * Tries each provider in order until one succeeds.
     */
    public function generateText(string $prompt): string
    {
        $prompt = $this->sanitizePrompt($prompt);
        $skipReasons = [];
        foreach ($this->providers as $provider) {
            if (! $provider->isAvailable()) {
                $skipReasons[] = "{$provider->getName()} (Unavailable: Key missing)";

                continue;
            }
            if ($this->isQuarantined($provider)) {
                $skipReasons[] = "{$provider->getName()} (Quarantined)";

                continue;
            }
            try {
                $startTime = microtime(true);
                Log::info("Trying AI Provider: {$provider->getName()} for text generation.");

                $result = $provider->generateText($prompt);

                $this->onSuccess($provider, microtime(true) - $startTime, $result['usage']);

                return $result['text'];
            } catch (\Exception $e) {
                $errors[] = $provider->getName().': '.$e->getMessage();
                Log::warning("AI Provider {$provider->getName()} failed for text generation: ".$e->getMessage());
                $this->onFailure($provider);

                if ($this->shouldFailover($e)) {
                    Log::info("Failing over from {$provider->getName()} due to: ".$e->getMessage());

                    continue;
                }

                throw $e;
            }
        }

        $finalMsg = 'Layanan AI sedang tidak tersedia saat ini. Silakan coba lagi beberapa saat lagi.';
        if (! empty($errors)) {
            $finalMsg .= ' ['.implode(' | ', $errors).']';
        } elseif (! empty($skipReasons)) {
            $finalMsg .= ' [Skipped: '.implode(', ', $skipReasons).']';
        }

        throw new AiServiceException($finalMsg);
    }

    /**
     * Tries each provider in order until one succeeds for vision tasks.
     */
    public function generateFromImage(string $prompt, string $base64Image, string $mimeType): string
    {
        $prompt = $this->sanitizePrompt($prompt);
        $skipReasons = [];
        foreach ($this->providers as $provider) {
            if (! $provider->isAvailable()) {
                Log::info("Provider {$provider->getName()} is NOT available.");
                $skipReasons[] = "{$provider->getName()} (Unavailable: Key missing)";

                continue;
            }
            if ($this->isQuarantined($provider)) {
                Log::info("Provider {$provider->getName()} is quarantined.");
                $skipReasons[] = "{$provider->getName()} (Quarantined)";

                continue;
            }
            if (! $provider->supportsVision()) {
                Log::info("Provider {$provider->getName()} does not support vision.");
                $skipReasons[] = "{$provider->getName()} (No vision support)";

                continue;
            }
            Log::info("Attempting Vision with Provider: {$provider->getName()}");
            try {
                $startTime = microtime(true);
                Log::info('Trying AI Provider (Vision): '.$provider->getName());

                $result = $provider->generateFromImage($prompt, $base64Image, $mimeType);

                $this->onSuccess($provider, microtime(true) - $startTime, $result['usage']);

                return $result['text'];
            } catch (\Exception $e) {
                $errors[] = $provider->getName().': '.$e->getMessage();
                $this->onFailure($provider);

                if ($this->shouldFailover($e)) {
                    continue;
                }

                throw $e;
            }
        }

        $finalMsg = 'Gagal memproses dokumen/gambar melalui AI. Silakan unggah ulang atau gunakan format lain.';
        if (! empty($errors)) {
            $finalMsg .= ' ['.implode(' | ', $errors).']';
        } elseif (! empty($skipReasons)) {
            $finalMsg .= ' [Skipped: '.implode(', ', $skipReasons).']';
        }

        throw new AiServiceException($finalMsg);
    }

    /**
     * Tries each provider in order until one succeeds for audio/voice tasks.
     */
    public function generateFromAudio(string $prompt, string $base64Audio, string $mimeType): string
    {
        $prompt = $this->sanitizePrompt($prompt);
        $errors = [];

        foreach ($this->providers as $provider) {
            if (! $provider->isAvailable()) {
                continue;
            }
            if ($this->isQuarantined($provider)) {
                continue;
            }
            if (! $provider->supportsAudio()) {
                continue;
            }
            try {
                $startTime = microtime(true);
                Log::info('Trying AI Provider (Audio): '.$provider->getName());

                $result = $provider->generateFromAudio($prompt, $base64Audio, $mimeType);

                $this->onSuccess($provider, microtime(true) - $startTime, $result['usage']);

                return $result['text'];
            } catch (\Exception $e) {
                $errors[] = $provider->getName().': '.$e->getMessage();
                $this->onFailure($provider);

                if ($this->shouldFailover($e)) {
                    continue;
                }

                throw $e;
            }
        }

        throw new AiServiceException('Gagal memproses input suara melalui AI. Silakan coba lagi. ['.implode(' | ', $errors).']');
    }

    public function forceReset(): void
    {
        foreach ($this->providers as $provider) {
            $name = $provider->getName();
            Cache::forget("ai_provider_quarantine_{$name}");
            Cache::forget("ai_provider_failures_{$name}");
        }
        Log::info('AI Provider Manager states have been force reset.');
    }

    /**
     * Get the registered providers (primarily for diagnostics).
     *
     * @return array<AiProviderInterface>
     */
    public function getProviders(): array
    {
        return $this->providers;
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

    /**
     * @param  array{prompt_tokens?: int, completion_tokens?: int, total_tokens?: int}  $usage
     */
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

    protected function onFailure(AiProviderInterface $provider): void
    {
        $key = 'ai_provider_errors_'.$provider->getName();
        $cachedErrors = Cache::get($key, 0);
        $errors = (is_int($cachedErrors) || is_string($cachedErrors) ? (int) $cachedErrors : 0) + 1;
        Cache::put($key, $errors, now()->addMinutes(60));

        Log::warning('AI Provider '.$provider->getName()." failed (Error count: {$errors})");

        // Let the Watchdog record this failure
        AiWatchdog::logPerformance($provider->getName(), 0.0, false);

        if ($errors >= $this->errorThreshold) {
            Log::alert('QUARANTINING AI provider: '.$provider->getName().' for '.$this->quarantineMinutes.' minutes!');
            Cache::put('ai_provider_quarantine_'.$provider->getName(), true, now()->addMinutes($this->quarantineMinutes));
        }
    }

    protected function shouldFailover(\Exception $e): bool
    {
        // Failover dynamically on ANY API error or network timeout.
        // We log the specific error in the onFailure method.
        $message = $e->getMessage();

        Log::warning("AI Failover Decision: Error '{$message}' triggered failover.");

        return true;
    }

    /**
     * Sanitizes prompts to prevent PII leakage to third-party AI providers.
     */
    protected function sanitizePrompt(string $prompt): string
    {
        // Simple regex patterns for common PII
        $patterns = [
            '/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/' => '[EMAIL_REDACTED]', // Emails
            '/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/' => '[PHONE_REDACTED]', // Phone numbers
        ];

        $result = preg_replace(array_keys($patterns), array_values($patterns), $prompt);

        return is_string($result) ? $result : $prompt;
    }
}
