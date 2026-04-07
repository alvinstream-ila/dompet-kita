<?php

namespace App\Actions\Finance\Wealth;

use App\Actions\BaseAction;
use App\Models\Asset;
use App\Services\MarketService;

class SyncMarketAssetsAction extends BaseAction
{
    public function __construct(
        protected MarketService $marketService
    ) {}

    /**
     * Synchronize all user assets that are linked to market rates.
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

                $oldValue = $asset->value;
                $newValue = $oldValue;
                $unit = strtoupper($asset->unit);

                // 1. Physical Gold Logic
                if ($asset->type === 'gold' && $unit === 'GRAM') {
                    $newValue = $asset->quantity * $market['gold_antam_gram'];
                }
                // 2. Foreign Currency Logic (USD, SGD, etc.)
                elseif ($asset->type === 'fcy' || in_array($unit, ['USD', 'SGD', 'EUR', 'JPY', 'GBP'])) {
                    $rate = $this->marketService->getRate($unit, 'IDR');
                    $newValue = $asset->quantity * $rate;
                }

                if ($newValue != $oldValue) {
                    $changePercent = $oldValue > 0 ? abs(($newValue - $oldValue) / $oldValue) * 100 : 0;

                    $asset->update(['value' => $newValue]);
                    $stats['updated']++;

                    if ($changePercent > 3) {
                        if (function_exists('activity')) {
                            activity('sentinel')
                                ->performedOn($asset)
                                ->withProperties([
                                    'old_value' => $oldValue,
                                    'new_value' => $newValue,
                                    'change_percent' => round($changePercent, 2),
                                    'market_rate' => $newValue / $asset->quantity,
                                ])
                                ->log("Proactive Sentinel Alert: Significant {$unit} Value Shift ($changePercent%) detected.");
                        }

                        $stats['alerts']++;
                    }
                }
            });

        return $stats;
    }
}
