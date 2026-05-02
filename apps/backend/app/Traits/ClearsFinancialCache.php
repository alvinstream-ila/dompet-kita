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
     * Invalidate the financial dashboard cache for the given user's scope.
     * If the user belongs to a household, the household-level cache is invalidated.
     */
    protected function invalidateFinancialCache(int|User $userOrId): void
    {
        $user = $userOrId instanceof User ? $userOrId : User::find($userOrId);
        if (! $user) {
            return;
        }

        $scopeId = $user->household_id ?? $user->id;
        $versionKey = "transaction_summary_version_{$scopeId}";

        try {
            if (! Cache::has($versionKey)) {
                Cache::put($versionKey, 1, now()->addDays(30));
            } else {
                Cache::increment($versionKey);
            }

            // 🤖 Clear AI Insights (Household or User level).
            Cache::forget("ai_insight_{$scopeId}");

            Log::debug("Financial cache invalidated for scope [{$scopeId}] (User: [{$user->id}]). Version incremented.");
        } catch (\Exception $e) {
            Log::error("Failed to invalidate financial cache for scope [{$scopeId}]: ".$e->getMessage());
        }
    }
}
