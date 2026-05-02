<?php

namespace Tests\Unit;

use App\Services\MarketService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MarketServiceTest extends TestCase
{
    /** @test */
    public function test_it_calculates_cross_rates_using_usd_pivot()
    {
        Cache::flush();
        
        // Mock Frankfurter API
        Http::fake([
            'api.frankfurter.app/latest?from=USD' => Http::response([
                'rates' => [
                    'IDR' => 15000.0,
                    'EUR' => 0.9,
                ]
            ], 200),
        ]);

        $service = new MarketService();
        
        // 1 EUR should be (15000 / 0.9) IDR = 16666.666...
        $rate = $service->getRate('EUR', 'IDR');
        
        $this->assertEqualsWithDelta(16666.6667, $rate, 0.001);
    }

    /** @test */
    public function test_it_handles_oz_to_gram_conversion_for_global_gold()
    {
        Cache::flush();

        // Mock Binance for PAXG (Global Spot)
        Http::fake([
            'api.binance.com/*' => Http::response(['price' => '2400.0'], 200),
            'api.frankfurter.app/*' => Http::response(['rates' => ['IDR' => 15000.0]], 200),
            'www.logammulia.com/*' => Http::response('1 gr</td><td>1.200.000', 200),
        ]);

        $service = new MarketService();
        $rates = $service->getRates();

        $this->assertEquals(2400.0, $rates['gold_global_oz']);
        // 2400 / 31.1034768 = 77.1617...
        $this->assertEqualsWithDelta(77.1618, $rates['gold_global_gram'], 0.001);
    }

    /** @test */
    public function test_it_uses_stale_cache_on_api_failure()
    {
        Cache::flush();
        
        $staleData = [
            'currency_rates' => ['IDR' => 15000.0],
            'gold_antam_gram' => 1200000.0,
            'gold_global_oz' => 2400.0,
            'gold_global_gram' => 77.16,
            'inflation_rate' => 0.035,
            'last_updated' => now()->toIso8601String(),
        ];
        
        Cache::put('market_rates_stale', $staleData, 86400);

        // Mock API failure
        Http::fake([
            '*' => Http::response([], 500),
        ]);

        $service = new MarketService();
        $rates = $service->getRates();

        $this->assertEquals(15000.0, $rates['currency_rates']['IDR']);
        $this->assertEquals(1200000.0, $rates['gold_antam_gram']);
    }
}
