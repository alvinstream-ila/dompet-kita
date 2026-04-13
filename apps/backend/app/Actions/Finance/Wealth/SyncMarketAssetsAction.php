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
        $market = $this->marketService->getRates();
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
     * Synchronize a single asset and handle auditing.
     *
     * @param  array<string, int>  $stats
     */
    private function syncAsset(Asset $asset, array $market, array &$stats): void
    {
        $oldValue = $asset->value;
        $newValue = $this->resolvePrice($asset, $market);

        if ($newValue != $oldValue) {
            $asset->update(['value' => $newValue]);
            $stats['updated']++;

            $this->logSignificantChange($asset, $oldValue, $newValue, $stats);
        }
    }

    /**
     * Map Asset Class and Symbol to a Market Price.
     *
     * @param  array<string, mixed>  $market
     */
    private function resolvePrice(Asset $asset, array $market): float
    {
        $symbol = strtoupper($asset->unit ?? '');
        $quantity = $asset->quantity;

        return match ($asset->type) {
            AssetType::INVESTMENT, AssetType::COMMODITY => $symbol === 'GRAM'
                ? $quantity * ($market['gold_antam_gram'] ?? 0)
                : $asset->value,

            AssetType::CASH => in_array($symbol, ['USD', 'SGD', 'EUR', 'JPY', 'GBP', 'AUD'])
                ? $quantity * $this->marketService->getRate($symbol, 'IDR')
                : $asset->value,

            AssetType::STOCK => $this->resolveStockPrice($asset, $symbol),

            AssetType::CRYPTO => $this->resolveCryptoPrice($asset, $symbol),

            default => $asset->value,
        };
    }

    private function resolveStockPrice(Asset $asset, string $symbol): float
    {
        if (empty($symbol)) {
            return $asset->value;
        }

        $price = $this->marketService->getStockPrice($symbol);
        if (! $price) {
            return $asset->value;
        }

        // International Conversion
        if (! str_ends_with($symbol, '.JK')) {
            $price *= $this->marketService->getRate('USD', 'IDR');
        }

        return $asset->quantity * $price;
    }

    private function resolveCryptoPrice(Asset $asset, string $symbol): float
    {
        if (empty($symbol)) {
            return $asset->value;
        }

        $price = $this->marketService->getCryptoPrice($symbol);
        if (! $price) {
            return $asset->value;
        }

        // USDT Conversion
        if (str_ends_with($symbol, 'USDT')) {
            $price *= $this->marketService->getRate('USD', 'IDR');
        }

        return $asset->quantity * $price;
    }

    /**
     * Audit and alert if value shift is significant (> 3%).
     *
     * @param  array<string, int>  $stats
     */
    private function logSignificantChange(Asset $asset, float $oldValue, float $newValue, array &$stats): void
    {
        $changePercent = $oldValue > 0 ? abs(($newValue - $oldValue) / $oldValue) * 100 : 0;

        if ($changePercent > 3 && function_exists('activity')) {
            activity('sentinel')
                ->performedOn($asset)
                ->withProperties([
                    'old_value' => $oldValue,
                    'new_value' => $newValue,
                    'change_percent' => round($changePercent, 2),
                    'market_rate' => $newValue / $asset->quantity,
                ])
                ->log("Supreme Sentinel Alert: Significant {$asset->unit} Value Shift (".round($changePercent, 2).'%) detected.');

            $stats['alerts']++;
        }
    }
}
