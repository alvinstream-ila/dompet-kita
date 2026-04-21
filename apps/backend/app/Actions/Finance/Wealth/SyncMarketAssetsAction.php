<?php

namespace App\Actions\Finance\Wealth;

use App\Actions\BaseAction;
use App\Enums\AssetType;
use App\Models\Asset;
use App\Services\MarketService;

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
        $market = (array) $this->marketService->getRates();
        /** @var array{updated: int, alerts: int} $stats */
        $stats = ['updated' => 0, 'alerts' => 0];

        Asset::marketSynced()
            ->each(function (Asset $asset) use ($market, &$stats) {
                if ($asset->quantity <= 0) {
                    return;
                }

                $this->syncAsset($asset, $market, $stats);
            });

        return $stats;
    }

    /**
     * @param  array<string, mixed>  $market
     * @param  array{updated: int, alerts: int}  $stats
     */
    private function syncAsset(Asset $asset, array $market, array &$stats): void
    {
        $oldValue = $asset->value;
        $unitPrice = $this->resolveUnitPrice($asset, $market);
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
        $this->recordDailyHistory($asset, $unitPrice);
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
                $price = $symbol === 'GRAM' ? (float) ($market['gold_antam_gram'] ?? 0.0) : 0.0;
                break;

            case AssetType::CASH:
                if (in_array($symbol, ['USD', 'SGD', 'EUR', 'JPY', 'GBP', 'AUD'])) {
                    $price = (float) $this->marketService->getRate($symbol, 'IDR');
                }
                break;

            case AssetType::STOCK:
                $price = $this->resolveStockUnitPrice($symbol);
                break;

            case AssetType::CRYPTO:
                $price = (float) $this->marketService->getCryptoPrice($symbol);
                break;

            default:
                $price = 0.0;
                break;
        }

        return $price;
    }

    private function resolveStockUnitPrice(string $symbol): float
    {
        if (empty($symbol)) {
            return 0.0;
        }

        $price = (float) $this->marketService->getStockPrice($symbol);
        if ($price <= 1.0) {
            return 0.0;
        }

        // International Conversion
        if (! str_ends_with($symbol, '.JK')) {
            $price *= (float) $this->marketService->getRate('USD', 'IDR');
        }

        return $price;
    }

    /**
     * Store price history point (Daily Granularity).
     */
    private function recordDailyHistory(Asset $asset, float $unitPrice): void
    {
        if ($unitPrice <= 0) {
            return;
        }

        // Check if we already have a record for today
        $existsForToday = $asset->priceHistories()
            ->whereDate('recorded_at', now()->toDateString())
            ->exists();

        if (! $existsForToday) {
            $asset->priceHistories()->create([
                'user_id' => $asset->user_id,
                'price' => $unitPrice,
                'recorded_at' => now(),
            ]);
        }
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
