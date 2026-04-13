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
     * Synchronize a single asset and handle auditing.
     *
     * @param  array<string, mixed>  $market
     * @param  array{updated: int, alerts: int}  $stats
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
        $symbol = strtoupper((string) ($asset->unit ?? ''));
        $quantity = (float) $asset->quantity;

        return match ($asset->type) {
            AssetType::INVESTMENT, AssetType::COMMODITY => $symbol === 'GRAM'
                ? $quantity * (float) ($market['gold_antam_gram'] ?? 0.0)
                : (float) $asset->value,

            AssetType::CASH => in_array($symbol, ['USD', 'SGD', 'EUR', 'JPY', 'GBP', 'AUD'])
                ? $quantity * (float) $this->marketService->getRate($symbol, 'IDR')
                : (float) $asset->value,

            AssetType::STOCK => $this->resolveStockPrice($asset, $symbol),

            AssetType::CRYPTO => $this->resolveCryptoPrice($asset, $symbol),

            default => (float) $asset->value,
        };
    }

    private function resolveStockPrice(Asset $asset, string $symbol): float
    {
        if (empty($symbol)) {
            return (float) $asset->value;
        }

        $price = (float) $this->marketService->getStockPrice($symbol);
        if ($price <= 0) {
            return (float) $asset->value;
        }

        // International Conversion
        if (! str_ends_with($symbol, '.JK')) {
            $price *= (float) $this->marketService->getRate('USD', 'IDR');
        }

        return (float) $asset->quantity * $price;
    }

    private function resolveCryptoPrice(Asset $asset, string $symbol): float
    {
        if (empty($symbol)) {
            return (float) $asset->value;
        }

        $price = (float) $this->marketService->getCryptoPrice($symbol);
        if ($price <= 0) {
            return (float) $asset->value;
        }

        // USDT Conversion
        if (str_ends_with($symbol, 'USDT')) {
            $price *= (float) $this->marketService->getRate('USD', 'IDR');
        }

        return (float) $asset->quantity * $price;
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
