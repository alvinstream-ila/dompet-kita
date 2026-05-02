<?php

declare(strict_types=1);

namespace App\Actions\Finance\Wealth;

use App\Actions\BaseAction;
use App\Enums\AssetType;
use App\Models\Asset;
use App\Models\AssetPriceHistory;
use App\Services\MarketService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SyncMarketAssetsAction extends BaseAction
{
    public function __construct(
        protected MarketService $marketService
    ) {}

    /**
     * Synchronize all user assets that are linked to market rates.
     *
     * @return array{updated: int, alerts: int}
     */
    public function execute(): array
    {
        // 🛡️ Fix 116: Prevent multiple sync jobs from running concurrently
        $lock = Cache::lock('sync_market_assets_lock', 300); // 5 minute lock

        if (! $lock->get()) {
            Log::warning('SyncMarketAssetsAction: Sync already in progress, skipping.');

            return ['updated' => 0, 'alerts' => 0];
        }

        try {
            $market = $this->marketService->getRates();
            /** @var array{updated: int, alerts: int} $stats */
            $stats = ['updated' => 0, 'alerts' => 0];

            // 🛡️ Fix 105: Bulk lookup of assets that already have today's price history to avoid N+1
            $today = now()->toDateString();
            $syncedTodayIds = AssetPriceHistory::withoutGlobalScopes()
                ->whereDate('recorded_at', $today)
                ->pluck('asset_id')
                ->toArray();

            // 🛡️ Fix 111: Check if market is likely closed (Weekend check for stocks)
            $isWeekend = now()->isWeekend();

            Asset::withoutGlobalScopes()
                ->marketSynced()
                ->chunk(100, function (Collection $assets) use ($market, $syncedTodayIds, $isWeekend, &$stats): void {
                    foreach ($assets as $asset) {
                        if ($asset->quantity <= 0) {
                            continue;
                        }

                        // Skip stocks/investments on weekends as markets are closed
                        if ($isWeekend && in_array($asset->type, [AssetType::STOCK, AssetType::INVESTMENT])) {
                            continue;
                        }

                        $this->syncAsset($asset, $market, $syncedTodayIds, $stats);
                    }
                });

            return $stats;
        } finally {
            $lock->release();
        }
    }

    /**
     * @param  array<string, mixed>  $market
     * @param  array<int, int>  $syncedTodayIds
     * @param  array{updated: int, alerts: int}  $stats
     */
    private function syncAsset(Asset $asset, array $market, array $syncedTodayIds, array &$stats): void
    {
        $oldValue = (float) $asset->value;
        $unitPrice = $this->resolveUnitPrice($asset, $market);

        // Safety Guard: Don't update with zero price (API failure/Outlier)
        if ($unitPrice <= 0) {
            return;
        }

        $newValue = $unitPrice * (float) $asset->quantity;

        // 1. Update Asset Value and Sync Timestamp
        $asset->update([
            'value' => $newValue,
            'last_synced_at' => now(),
        ]);

        if ($newValue !== $oldValue) {
            $stats['updated']++;
            $this->logSignificantChange($asset, $oldValue, $newValue, $stats);
        }

        // 2. Record Price History (Once Per Day per Asset)
        // Check bulk lookup result instead of N+1 query
        if (! in_array($asset->id, $syncedTodayIds)) {
            $this->recordDailyHistory($asset, $unitPrice);
        }
    }

    /**
     * Resolve the unit price (price per 1 unit) from market data.
     *
     * @param  array<string, mixed>  $market
     */
    private function resolveUnitPrice(Asset $asset, array $market): float
    {
        $symbol = strtoupper((string) ($asset->unit ?? ''));
        $price = 0.0;

        switch ($asset->type) {
            case AssetType::INVESTMENT:
            case AssetType::COMMODITY:
                // Fix 93/94/113: Improved Gold Price Resolution (Gram vs Oz)
                if ($symbol === 'GRAM' || $symbol === 'GR') {
                    $price = (float) ($market['gold_antam_gram'] ?? 0.0);
                } elseif ($symbol === 'OZ' || $symbol === 'PAXG') {
                    $price = (float) ($market['gold_global_oz'] ?? 0.0);
                    // If the user's asset quantity is in GRAM but they use Global Spot ticker, convert price to Gram
                    if ($asset->unit === 'GRAM') {
                        $price = (float) ($market['gold_global_gram'] ?? 0.0);
                    }
                }
                break;

            case AssetType::CASH:
                // Fix 118: Expanded currency support
                $price = $this->marketService->getRate($symbol, 'IDR');
                break;

            case AssetType::STOCK:
                $price = $this->resolveStockUnitPrice($symbol);
                break;

            case AssetType::CRYPTO:
                // Fix 142: Convert Crypto (USD base) to IDR
                $cryptoPriceUsd = (float) $this->marketService->getCryptoPrice($symbol);
                $usdToIdr = $this->marketService->getRate('USD', 'IDR');
                $price = $cryptoPriceUsd * $usdToIdr;
                break;

            default:
                $price = 0.0;
                break;
        }

        return $price;
    }

    private function resolveStockUnitPrice(string $symbol): float
    {
        if ($symbol === '' || $symbol === '0') {
            return 0.0;
        }

        $price = (float) $this->marketService->getStockPrice($symbol);
        if ($price <= 1.0) {
            return 0.0;
        }

        // International Conversion
        if (! str_ends_with($symbol, '.JK')) {
            $price *= $this->marketService->getRate('USD', 'IDR');
        }

        return $price;
    }

    private function recordDailyHistory(Asset $asset, float $unitPrice): void
    {
        if ($unitPrice <= 0) {
            return;
        }

        // 🛡️ Performance: Redundant check removed as it's handled by bulk lookup in execute()
        $asset->priceHistories()->create([
            'user_id' => $asset->user_id,
            'household_id' => $asset->household_id,
            'price' => $unitPrice,
            'recorded_at' => now(),
        ]);
    }

    /**
     * Audit and alert if value shift is significant (> 3%).
     *
     * @param  array{updated: int, alerts: int}  $stats
     */
    private function logSignificantChange(Asset $asset, float $oldValue, float $newValue, array &$stats): void
    {
        $changePercent = $oldValue > 0 ? abs(($newValue - $oldValue) / $oldValue) * 100 : 0;

        if ($changePercent > 3 && function_exists('activity')) {
            $quantity = (float) $asset->quantity;
            $unit = (string) ($asset->unit ?? 'Asset');

            activity('sentinel')
                ->performedOn($asset)
                ->withProperties([
                    'household_id' => $asset->household_id,
                    'old_value' => $oldValue,
                    'new_value' => $newValue,
                    'change_percent' => round($changePercent, 2),
                    'market_rate' => $quantity > 0 ? $newValue / $quantity : 0,
                ])
                ->log("Supreme Sentinel Alert: Significant {$unit} Value Shift (".round($changePercent, 2).'%) detected.');

            $stats['alerts']++;
        }
    }
}
