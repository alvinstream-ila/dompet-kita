<?php

namespace App\Services;

use App\Exceptions\MarketServiceException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * MarketService: Market Awareness for Rates (Sovereign v7.1.18).
 */
class MarketService
{
    private const CACHE_KEY = 'market_rates';

    private const CACHE_TTL = 3600; // 1 Hour

    // 2026 Sovereign Failover Constants
    private const FAILOVER_USD_IDR = 16950.0;

    private const FAILOVER_GOLD_ANTAM = 2525000.0;

    /**
     * Get current market rates with robust caching and failover.
     *
     * @return array{currency_rates: array<string, float>, gold_antam_gram: float, last_updated: string}
     */
    public function getRates(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function (): array {
            try {
                // Mock Fetch (In production, replace with real API like CurrencyBeacon/GoldAPI)
                $response = Http::timeout(5)->get('https://api.exchangerate-api.com/v4/latest/USD');

                if (! $response->successful()) {
                    throw new MarketServiceException('Market API Unavailable');
                }

                $data = $response->json();

                return [
                    'currency_rates' => array_map('floatval', $data['rates'] ?? ['IDR' => self::FAILOVER_USD_IDR]),
                    'gold_antam_gram' => self::FAILOVER_GOLD_ANTAM, // Fallback for gold
                    'last_updated' => now()->toIso8601String(),
                ];
            } catch (\Exception $e) {
                Log::warning('MarketService Failover Triggered: '.$e->getMessage());

                return [
                    'currency_rates' => ['IDR' => self::FAILOVER_USD_IDR],
                    'gold_antam_gram' => self::FAILOVER_GOLD_ANTAM,
                    'last_updated' => now()->toIso8601String(),
                ];
            }
        });
    }

    /**
     * Force refresh market data.
     */
    public function refresh(): void
    {
        Cache::forget(self::CACHE_KEY);
        $this->getRates();
    }
}
