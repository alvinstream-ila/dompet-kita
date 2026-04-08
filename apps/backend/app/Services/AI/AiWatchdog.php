<?php

namespace App\Services\AI;

use Illuminate\Support\Facades\Cache;

/**
 * AI Watchdog: The silent guardian of your AI models.
 * It automatically handles performance monitoring and recovery.
 */
class AiWatchdog
{
    public static function logPerformance(string $provider, float $latency, bool $success, int $inputTokens = 0, int $outputTokens = 0): void
    {
        $history = Cache::get('ai_perf_history', []);
        $history[] = [
            'provider' => $provider,
            'latency' => round($latency, 3),
            'success' => $success,
            'input_tokens' => $inputTokens,
            'output_tokens' => $outputTokens,
            'total_tokens' => $inputTokens + $outputTokens,
            'time' => now()->toDateTimeString(),
        ];

        // Keep only last 50 events
        if (count($history) > 50) {
            array_shift($history);
        }

        Cache::put('ai_perf_history', $history, now()->addDays(7));
    }

    /**
     * @return array<string, array{name: string, status: string, recent_latency: float}>
     */
    public static function getStatus(): array
    {
        return collect([
            'groq' => self::checkQuarantine('groq'),
            'openrouter' => self::checkQuarantine('openrouter'),
            'gemini' => self::checkQuarantine('gemini'),
        ])->map(function ($isQuarantined, $name) {
            return [
                'name' => ucfirst($name),
                'status' => $isQuarantined ? 'Quarantined (Down)' : 'Healthy',
                'recent_latency' => self::getRecentLatency($name),
            ];
        })->toArray();
    }

    /**
     * @return array{prompt: int, completion: int, total: int}
     */
    public static function getTokenUsage(string $name): array
    {
        $history = Cache::get('ai_perf_history', []);
        $usage = collect($history)
            ->where('provider', $name)
            ->where('success', true);

        return [
            'prompt' => $usage->sum('input_tokens'),
            'completion' => $usage->sum('output_tokens'),
            'total' => $usage->sum('total_tokens'),
        ];
    }

    protected static function checkQuarantine(string $name): bool
    {
        return Cache::has('ai_provider_quarantine_'.$name);
    }

    protected static function getRecentLatency(string $name): float
    {
        $history = Cache::get('ai_perf_history', []);
        $latencies = collect($history)
            ->where('provider', $name)
            ->where('success', true)
            ->take(-5)
            ->pluck('latency');

        return $latencies->isEmpty() ? 0.0 : $latencies->average();
    }
}
