<?php

namespace Tests\Feature\Finance;

use App\Actions\Finance\Wealth\SyncMarketAssetsAction;
use App\Models\Asset;
use App\Models\AssetPriceHistory;
use App\Models\Household;
use App\Models\User;
use App\Services\MarketService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class SyncMarketAssetsTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;
    protected Household $household;

    protected function setUp(): void
    {
        parent::setUp();

        $this->household = Household::factory()->create();
        $this->user = User::factory()->create(['household_id' => $this->household->id]);
    }

    /** @test */
    public function test_it_skips_sync_on_weekends_for_stocks()
    {
        // Mock a Sunday
        Carbon::setTestNow(Carbon::parse('2026-05-03 10:00:00')); // Sunday
        
        Asset::create([
            'user_id' => $this->user->id,
            'household_id' => $this->household->id,
            'name' => 'Apple',
            'type' => \App\Enums\AssetType::STOCK,
            'unit' => 'AAPL',
            'quantity' => 10,
            'value' => 1000,
            'invested_capital' => 1000,
            'is_market_synced' => true,
        ]);

        $action = new SyncMarketAssetsAction(new MarketService());
        $action->execute($this->user);

        $this->assertEquals(0, AssetPriceHistory::count());
        
        Carbon::setTestNow();
    }

    /** @test */
    public function test_it_creates_price_history_with_high_precision()
    {
        // Mock a Monday
        Carbon::setTestNow(Carbon::parse('2026-05-04 10:00:00')); // Monday
        
        Asset::create([
            'user_id' => $this->user->id,
            'household_id' => $this->household->id,
            'name' => 'Bitcoin',
            'type' => \App\Enums\AssetType::CRYPTO,
            'unit' => 'BTC',
            'quantity' => 0.5,
            'value' => 30000,
            'invested_capital' => 30000,
            'is_market_synced' => true,
        ]);

        // Mock MarketService to return a high precision price
        $marketService = $this->createMock(MarketService::class);
        $marketService->method('getRates')->willReturn([
            'currency_rates' => ['IDR' => 1.0, 'USD' => 15000.0],
            'crypto_prices' => ['BTC' => 65432.12345678],
        ]);
        $marketService->method('getCryptoPrice')->with('BTC')->willReturn(65432.12345678);
        $marketService->method('getRate')->with('USD', 'IDR')->willReturn(15000.0);

        $action = new SyncMarketAssetsAction($marketService);
        $action->execute();

        $history = AssetPriceHistory::withoutGlobalScopes()->first();
        $this->assertNotNull($history, 'Price history should have been created');
        
        // Assert precision is maintained in the history (Price is converted to IDR)
        $expectedPrice = 65432.12345678 * 15000.0;
        $this->assertEquals($expectedPrice, (float) $history->price);
        
        Carbon::setTestNow();
    }

    /** @test */
    public function test_it_prevents_concurrent_syncs_using_lock()
    {
        Cache::put('sync_market_assets_lock', true, 60);

        Asset::create([
            'user_id' => $this->user->id,
            'household_id' => $this->household->id,
            'name' => 'Ethereum',
            'type' => \App\Enums\AssetType::CRYPTO,
            'unit' => 'ETH',
            'quantity' => 1,
            'value' => 3000,
            'invested_capital' => 3000,
            'is_market_synced' => true,
        ]);

        $action = new SyncMarketAssetsAction(new MarketService());
        $action->execute($this->user);

        // Should skip because lock is present
        $this->assertEquals(0, AssetPriceHistory::count());
        
        Cache::forget('sync_market_assets_lock');
    }
}
