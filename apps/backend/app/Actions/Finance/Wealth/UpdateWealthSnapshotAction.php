<?php

declare(strict_types=1);

namespace App\Actions\Finance\Wealth;

use App\Actions\BaseAction;
use App\Models\Asset;
use App\Models\User;
use App\Models\WealthHistory;
use App\Services\MarketService;

class UpdateWealthSnapshotAction extends BaseAction
{
    public function __construct(
        protected MarketService $marketService
    ) {}

    public function execute(User $user): WealthHistory
    {
        $month = \now()->month;
        $year = \now()->year;
        $householdId = $user->household_id;
        $baseCurrency = $user->currency_format ?: 'IDR';

        // Aggregate total value of ALL assets in the household (or user if no household yet)
        $query = Asset::query();
        if ($householdId) {
            $query->where('household_id', $householdId);
        } else {
            $query->where('user_id', $user->id);
        }

        $assets = $query->get();
        $total = 0.0;

        foreach ($assets as $asset) {
            $assetValue = (float) $asset->value;
            $assetCurrency = $asset->currency ?: 'IDR';

            if ($assetCurrency !== $baseCurrency) {
                $rate = $this->marketService->getRate($assetCurrency, $baseCurrency);
                $assetValue *= $rate;
            }

            $total += $assetValue;
        }

        return WealthHistory::updateOrCreate(
            [
                'household_id' => $householdId,
                'month' => $month,
                'year' => $year,
            ],
            [
                'total_value' => $total,
                'user_id' => $user->id, // Track who performed the latest update
            ]
        );
    }
}
