<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * MarketService: Market Awareness for Rates (Sovereign v7.1.18).
 */
class MarketService
{
    private const string CACHE_KEY = 'market_rates';

    private const int CACHE_TTL = 300; // 5 Minutes for Realtime Feel

    // 2026 Sovereign Failover Constants
    private const float FAILOVER_USD_IDR = 16950.0;

    private const float FAILOVER_GOLD_ANTAM = 2525000.0;

    /**
     * Get current market rates with robust caching and failover.
     *
     * @return array{
     *     currency_rates: array<string, float>,
     *     gold_antam_gram: float,
     *     gold_global_oz: float,
     *     inflation_rate: float,
     *     last_updated: string
     * }
     */
    public function getRates(): array
    {
        /** @var array{currency_rates: array<string, float>, gold_antam_gram: float, gold_global_oz: float, inflation_rate: float, last_updated: string} */
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function (): array {
            try {
                // 1. Forex: Frankfurter (Unlimited/Keyless)
                $fxResponse = Http::timeout(5)->withoutVerifying()->get('https://api.frankfurter.app/latest?from=USD');
                $fxData = $fxResponse->successful() ? (array) $fxResponse->json() : [];
                $currencyRates = $fxData['rates'] ?? ['IDR' => self::FAILOVER_USD_IDR];
                assert(is_array($currencyRates));

                // 2. Gold: Antam Scraper (Indonesia Retail)
                $goldAntam = $this->scrapeAntam();

                // 3. Gold Pulse: Binance PAXG (Global Spot)
                $goldPulse = $this->getCryptoPrice('PAXGUSDT');

                return [
                    'currency_rates' => array_map(fn ($val): float => is_numeric($val) ? (float) $val : 0.0, $currencyRates),
                    'gold_antam_gram' => is_numeric($goldAntam) ? $goldAntam : self::FAILOVER_GOLD_ANTAM,
                    'gold_global_oz' => is_numeric($goldPulse) ? $goldPulse : 2400.0,
                    'inflation_rate' => 0.035, // Default 3.5%
                    'last_updated' => now()->toIso8601String(),
                ];
            } catch (\Exception $e) {
                Log::warning('MarketService Failover Triggered: '.$e->getMessage());

                return [
                    'currency_rates' => ['IDR' => self::FAILOVER_USD_IDR],
                    'gold_antam_gram' => self::FAILOVER_GOLD_ANTAM,
                    'gold_global_oz' => 2400.0,
                    'inflation_rate' => 0.035,
                    'last_updated' => now()->toIso8601String(),
                ];
            }
        });
    }

    /**
     * Scrape official Antam price from logammulia.com
     */
    public function scrapeAntam(): ?float
    {
        return retry(2, function (): ?float {
            try {
                $response = Http::timeout(15)->withoutVerifying()->get('https://www.logammulia.com/id/harga-emas-hari-ini');
                if (! $response->successful()) {
                    return null;
                }

                $body = $response->body();
                // Strategy: Find the "1 gr" row and extract the first numeric value after it (Harga Dasar)
                if (preg_match('/1 gr\s*<\/td>\s*<td[^>]*>\s*([\d,.]+)/i', $body, $matches)) {
                    return (float) str_replace(['.', ','], '', $matches[1]);
                }

                // Fallback for different HTML structures
                if (preg_match('/idr">([0-9.]+)/', $body, $matches)) {
                    return (float) str_replace('.', '', $matches[1]);
                }
            } catch (\Exception $e) {
                Log::error('Antam Scraping Attempt Failed: '.$e->getMessage());
                throw $e;
            }

            return null;
        }, 500);
    }

    /**
     * Get Crypto Price from Binance Public API (Keyless)
     * Supports multi-endpoint failover for better global reach.
     */
    public function getCryptoPrice(string $symbol): ?float
    {
        $cacheKey = "crypto_price_{$symbol}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($symbol): ?float {
            // Try Local Path First for stability in Indonesia (Indodax)
            if (str_ends_with($symbol, 'IDR') || str_ends_with($symbol, 'USDT')) {
                $localPrice = $this->getIndodaxPrice($symbol);
                if ($localPrice) {
                    return $localPrice;
                }
            }

            $endpoints = [
                "https://api.binance.com/api/v3/ticker/price?symbol={$symbol}",
                "https://api1.binance.com/api/v3/ticker/price?symbol={$symbol}",
                "https://api3.binance.com/api/v3/ticker/price?symbol={$symbol}",
            ];

            foreach ($endpoints as $url) {
                try {
                    $response = Http::timeout(10)->withoutVerifying()->get($url);
                    if ($response->successful()) {
                        $priceData = $response->json('price');

                        return is_numeric($priceData) ? (float) $priceData : null;
                    }
                } catch (\Exception $e) {
                    Log::warning("Binance Fetch Failed for {$symbol} on {$url}: ".$e->getMessage());
                }
            }

            return null;
        });
    }

    /**
     * Get Stock Price from Yahoo Finance (Keyless Chart API)
     */
    public function getStockPrice(string $symbol): ?float
    {
        $cacheKey = "stock_price_{$symbol}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($symbol): ?float {
            try {
                // Yahoo Finance Chart API is more stable than others for public use
                $response = Http::timeout(5)->withoutVerifying()->get("https://query1.finance.yahoo.com/v8/finance/chart/{$symbol}");
                if ($response->successful()) {
                    $priceData = $response->json('chart.result.0.meta.regularMarketPrice');

                    return is_numeric($priceData) ? (float) $priceData : null;
                }
            } catch (\Exception $e) {
                Log::error("Yahoo Finance Fetch Failed for {$symbol}: ".$e->getMessage());
            }

            return null;
        });
    }

    /**
     * Fetch crypto price from Indodax (Fallback for IDR pairs/ISP blocks).
     */
    public function getIndodaxPrice(string $symbol): ?float
    {
        // Indodax uses underscore format: btc_idr
        $pair = strtolower(str_replace(['IDR', 'USDT'], ['_idr', '_usdt'], $symbol));
        if (! str_contains($pair, '_')) {
            $pair .= '_idr';
        }

        return retry(2, function () use ($pair): ?float {
            try {
                $response = Http::timeout(10)->withoutVerifying()->get("https://indodax.com/api/ticker/{$pair}");
                if ($response->successful()) {
                    $price = $response->json('ticker.last');

                    return is_numeric($price) ? (float) $price : null;
                }
            } catch (\Exception $e) {
                Log::warning("Indodax Fetch Failed for {$pair}: ".$e->getMessage());
            }

            return null;
        });
    }

    /**
     * Get a specific rate for a currency pair.
     */
    public function getRate(string $from, string $to): float
    {
        $rates = $this->getRates();

        // Standardized to IDR base for now as per app logic
        if ($to === 'IDR' && isset($rates['currency_rates'][$from])) {
            return $rates['currency_rates'][$from];
        }

        return 1.0;
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
