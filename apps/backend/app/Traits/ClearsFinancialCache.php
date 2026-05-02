<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * Trait ClearsFinancialCache
 * Unified "Sovereign Invalidator" for all financial modules.
 * Ensures that any change to transactions, assets, loans, or goals
 * instantly busts the backend cache for the user dashboard.
 */
trait ClearsFinancialCache
{
    /**
     * Invalidate the financial dashboard cache for the given user's scope or direct household ID.
     * If a user ID or User object is provided, the household-level cache is invalidated.
     * If a string is provided, it is treated as a direct scope ID (e.g. Household UUID).
     */
    protected function invalidateFinancialCache(int|User|string $scope): void
    {
        $scopeId = null;

        if (is_string($scope)) {
            $scopeId = $scope;
        } else {
            $user = $scope instanceof User ? $scope : User::find($scope);
            if (! $user) {
                return;
            }
            $scopeId = $user->household_id ?? (string) $user->id;
        }

        $versionKey = "transaction_summary_version_{$scopeId}";

        try {
            // 🛡️ Fix: Default summary version is 1. We start at 2 to ensure first invalidation busts cache.
            if (! Cache::has($versionKey)) {
                Cache::put($versionKey, 2, now()->addDays(30));
            } else {
                Cache::increment($versionKey);
            }

            // 🤖 Clear AI Insights (Household or User level).
            Cache::forget("ai_insight_{$scopeId}");

            if (! app()->runningUnitTests()) {
                Log::info("Financial cache invalidated for scope [{$scopeId}]. Version: ".(string) Cache::get($versionKey));
            }
        } catch (\Exception $e) {
            if (! app()->runningUnitTests()) {
                Log::error("Failed to invalidate financial cache for scope [{$scopeId}]: ".$e->getMessage());
            }
        }
    }
}
