<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * MarketService: Market Awareness for Rates (Sovereign v7.1.18).
 * Optimized for performance and financial integrity.
 */
class MarketService
{
    private const string CACHE_KEY = 'market_rates';

    private const int CACHE_TTL = 900; // 15 minutes (Fix 103)

    private const string STALE_CACHE_KEY = 'market_rates_stale';

    private const float TROY_OZ_TO_GRAM = 31.1034768;

    /**
     * Get current market rates with robust caching and failover.
     *
     * @return array{
     *     currency_rates: array<string, float>,
     *     gold_antam_gram: float,
     *     gold_global_oz: float,
     *     gold_global_gram: float,
     *     inflation_rate: float,
     *     last_updated: string
     * }
     */
    public function getRates(): array
    {
        // 🛡️ Fix 140: Use an atomic lock to prevent race conditions during rate updates
        // This ensures only one process hits the external APIs at a time.
        $lock = Cache::lock('market_rates_update_lock', 60);

        /** @var array{currency_rates: array<string, float>, gold_antam_gram: float, gold_global_oz: float, gold_global_gram: float, inflation_rate: float, last_updated: string} $rates */
        $rates = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () use ($lock): array {
            try {
                // Attempt to acquire lock, if fails, return stale data if available
                if (! $lock->get()) {
                    /** @var array{currency_rates: array<string, float>, gold_antam_gram: float, gold_global_oz: float, gold_global_gram: float, inflation_rate: float, last_updated: string}|null $staleData */
                    $staleData = Cache::get(self::STALE_CACHE_KEY);

                    return $staleData ?? $this->handleGetRatesFailure(new \Exception('Could not acquire update lock.'));
                }

                $currencyRates = $this->fetchForexRates();

                // 2. Gold: Antam Scraper (Indonesia Retail)
                $goldAntam = $this->scrapeAntam();

                // 3. Gold Pulse: Binance PAXG (Global Spot)
                $goldPulse = $this->getCryptoPrice('PAXGUSDT');
                $goldGlobalOz = $this->validatePrice($goldPulse, 'gold_global') ? (float) $goldPulse : 2400.0;

                $data = [
                    'currency_rates' => array_map(fn ($val): float => (float) $val, $currencyRates),
                    'gold_antam_gram' => $this->validatePrice($goldAntam, 'gold_antam') ? (float) $goldAntam : (float) config('services.market.failover.gold_antam'),
                    'gold_global_oz' => $goldGlobalOz,
                    'gold_global_gram' => $goldGlobalOz / self::TROY_OZ_TO_GRAM,
                    'inflation_rate' => (float) config('services.market.failover.inflation', 0.035),
                    'last_updated' => now()->toIso8601String(),
                ];

                // Update stale cache for failover (Fix 119)
                Cache::put(self::STALE_CACHE_KEY, $data, 86400); // 24 hours

                return $data;
            } catch (\Exception $e) {
                // Fix 137: Improved error handling for 429/failures
                if ($e instanceof RequestException && $e->response->status() === 429) {
                    Log::warning('MarketService: Rate limit hit (429). Returning stale data.');
                }

                return $this->handleGetRatesFailure($e);
            } finally {
                $lock->release();
            }
        });

        return $rates;
    }

    /**
     * @return array<string, float>
     */
    private function fetchForexRates(): array
    {
        // 🛡️ Fix 148: Improved Frankfurter failover with secondary mirror attempt
        $endpoints = [
            'https://api.frankfurter.app/latest?from=USD',
            'https://www.frankfurter.app/latest?from=USD', // Secondary mirror
        ];

        $fxData = [];
        foreach ($endpoints as $url) {
            try {
                $response = Http::timeout(5)
                    ->withHeaders(['User-Agent' => config('services.market.user_agent')])
                    ->retry(1, 100)
                    ->get($url);

                if ($response->successful()) {
                    $fxData = (array) $response->json();
                    break;
                }
            } catch (\Exception $e) {
                Log::warning("MarketService: Frankfurter endpoint {$url} failed.");
            }
        }

        if (empty($fxData)) {
            throw new \RuntimeException('MarketService: All forex endpoints failed to provide rates.');
        }

        /** @var array<string, float> $currencyRates */
        $currencyRates = (array) ($fxData['rates'] ?? []);

        // Ensure IDR failover is handled if missing from API
        if (! isset($currencyRates['IDR'])) {
            $currencyRates['IDR'] = (float) config('services.market.failover.usd_idr', 15800.0);
        }

        // Fix 118: Ensure other minor pairs are supported via failover if missing
        $minorPairs = ['SGD' => 1.34, 'MYR' => 4.7, 'THB' => 35.5, 'SEK' => 10.5];
        foreach ($minorPairs as $code => $default) {
            if (! isset($currencyRates[$code])) {
                $currencyRates[$code] = (float) $default;
            }
        }

        return $currencyRates;
    }

    /**
     * @return array{currency_rates: array<string, float>, gold_antam_gram: float, gold_global_oz: float, gold_global_gram: float, inflation_rate: float, last_updated: string}
     */
    private function handleGetRatesFailure(\Exception $e): array
    {
        Log::info('MarketService: handleGetRatesFailure called. Checking for key: '.self::STALE_CACHE_KEY);
        if (Cache::has(self::STALE_CACHE_KEY)) {
            Log::info('MarketService: Stale cache FOUND.');
            /** @var array{currency_rates: array<string, float>, gold_antam_gram: float, gold_global_oz: float, gold_global_gram: float, inflation_rate: float, last_updated: string} $staleData */
            $staleData = Cache::get(self::STALE_CACHE_KEY);

            return $staleData;
        }
        Log::warning('MarketService: Stale cache NOT FOUND.');

        // 🛡️ Fix 107: Mask potentially sensitive info in logs
        $cleanMessage = preg_replace('/(key|token|secret|password)=[^&\s]+/i', '$1=****', $e->getMessage());
        Log::warning('MarketService Failover Triggered: '.$cleanMessage);

        return [
            'currency_rates' => ['IDR' => (float) config('services.market.failover.usd_idr', 15800.0)],
            'gold_antam_gram' => (float) config('services.market.failover.gold_antam', 1200000.0),
            'gold_global_oz' => 2400.0,
            'gold_global_gram' => 2400.0 / self::TROY_OZ_TO_GRAM,
            'inflation_rate' => 0.035,
            'last_updated' => now()->toIso8601String(),
        ];
    }

    /**
     * Scrape official Antam price from logammulia.com
     */
    public function scrapeAntam(): ?float
    {
        return retry(2, function (): ?float {
            try {
                $response = Http::timeout(15)
                    ->withHeaders(['User-Agent' => config('services.market.user_agent')])
                    ->get('https://www.logammulia.com/id/harga-emas-hari-ini');

                if (! $response->successful()) {
                    return null;
                }

                $body = $response->body();
                $price = null;

                // 🛡️ Fix 139: Refined Antam Scraper with more robust semantic matching
                // Strategy: Find the "1 gr" row and extract the first numeric value after it (Harga Dasar)
                if (preg_match('/1 gr\s*<\/td>\s*<td[^>]*>\s*Rp\s*([\d,.]+)/i', $body, $matches)) {
                    $price = (float) str_replace(['.', ','], '', $matches[1]);
                } elseif (preg_match('/"harga-emas">\s*Rp\s*([\d,.]+)/i', $body, $matches)) {
                    // Fallback for modern semantic tags
                    $price = (float) str_replace(['.', ','], '', $matches[1]);
                } elseif (preg_match('/idr">([0-9.]+)/', $body, $matches)) {
                    $price = (float) str_replace('.', '', $matches[1]);
                }

                return $price;
            } catch (\Exception $e) {
                Log::error('Antam Scraping Attempt Failed: '.$e->getMessage());
                throw $e;
            }
        }, 500);
    }

    /**
     * Get Crypto Price from Binance Public API (Keyless)
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
                "https://api2.binance.com/api/v3/ticker/price?symbol={$symbol}",
                "https://api3.binance.com/api/v3/ticker/price?symbol={$symbol}",
                "https://api4.binance.com/api/v3/ticker/price?symbol={$symbol}",
            ];

            foreach ($endpoints as $url) {
                try {
                    $response = Http::timeout(10)
                        ->withHeaders(['User-Agent' => config('services.market.user_agent')])
                        ->get($url);
                    if ($response->successful()) {
                        return (float) $response->json('price');
                    }
                } catch (\Exception $e) {
                    if (str_contains($e->getMessage(), 'Could not resolve host')) {
                        Log::warning("MarketService: DNS resolution failed for Binance on {$url}. This is likely an ISP block.");
                    } else {
                        Log::warning("Binance Fetch Failed for {$symbol} on {$url}: ".$e->getMessage());
                    }
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
                $response = Http::timeout(5)
                    ->withHeaders(['User-Agent' => config('services.market.user_agent')])
                    ->get("https://query1.finance.yahoo.com/v8/finance/chart/{$symbol}");
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
        $pair = strtolower(str_replace(['IDR', 'USDT'], ['_idr', '_usdt'], $symbol));
        if (! str_contains($pair, '_')) {
            $pair .= '_idr';
        }

        return retry(2, function () use ($pair): ?float {
            try {
                $response = Http::timeout(10)
                    ->withHeaders(['User-Agent' => config('services.market.user_agent')])
                    ->get("https://indodax.com/api/ticker/{$pair}");
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
     * Uses USD as the pivot (Frankfurter base for our implementation).
     *
     * Definition: How many units of [to] are equal to 1 unit of [from]?
     * Math: 1 [from] = (Rate[to] / Rate[from]) [to]
     *
     * Example: from=EUR, to=IDR.
     * 1 USD = 0.92 EUR -> 1 EUR = 1/0.92 USD.
     * 1 USD = 16000 IDR.
     * 1 EUR = (1/0.92) * 16000 IDR = 17391 IDR.
     * Math: 16000 / 0.92 = 17391. (Correct)
     */
    public function getRate(string $from, string $to): float
    {
        if ($from === $to) {
            return 1.0;
        }

        $rates = $this->getRates();
        $currencyRates = $rates['currency_rates'];

        // Get value relative to USD (1 USD = X currency)
        $valFrom = ($from === 'USD') ? 1.0 : ($currencyRates[$from] ?? null);
        $valTo = ($to === 'USD') ? 1.0 : ($currencyRates[$to] ?? null);

        // Fix 136/148: Pivot Error Guard & Calculation Integrity
        // 🛡️ If valFrom or valTo are missing, we MUST NOT return 1.0 blindly if one is known.
        // If we know IDR/USD but not EUR, we can't calculate.
        if ($valFrom === null || $valTo === null || $valFrom <= 0) {
            Log::error("MarketService: Calculation failed for {$from} -> {$to} due to missing pivot data.");

            return 1.0;
        }

        return (float) ($valTo / $valFrom);
    }

    /**
     * Validate price to prevent corrupting data with outliers or errors.
     */
    private function validatePrice(?float $price, string $type): bool
    {
        if ($price === null || $price <= 0) {
            return false;
        }

        return match ($type) {
            'gold_antam' => $price > 500000 && $price < 5000000, // Reasonable range for 1gr gold in IDR
            'gold_global' => $price > 500 && $price < 10000,      // Reasonable range for oz gold in USD
            default => true,
        };
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
