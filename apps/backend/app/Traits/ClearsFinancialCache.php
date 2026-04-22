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
     * Invalidate the user's financial dashboard cache.
     * If the user belongs to a household, all members' caches are invalidated.
     */
    protected function invalidateFinancialCache(int|User $userOrId): void
    {
        $user = $userOrId instanceof User ? $userOrId : User::find($userOrId);
        if (! $user) {
            return;
        }

        $userIds = [$user->id];

        // 🏠 Sovereign Household Sync: If in a household, invalidate for everyone.
        if ($user->household_id) {
            $userIds = User::where('household_id', $user->household_id)->pluck('id')->toArray();
        }

        foreach ($userIds as $id) {
            $this->bumpUserCacheVersion($id);
        }
    }

    /**
     * Helper to increment the version key and clear related insights.
     */
    private function bumpUserCacheVersion(int $userId): void
    {
        $user = User::find($userId);
        if (! $user) {
            return;
        }

        $versionKey = "transaction_summary_version_{$userId}";

        try {
            if (! Cache::has($versionKey)) {
                Cache::put($versionKey, 1, now()->addDays(30));
            } else {
                Cache::increment($versionKey);
            }

            // 🤖 Clear AI Insights.
            // If in a household, we clear the household-level insight cache.
            $scopeId = $user->household_id ?? $user->id;
            Cache::forget("ai_insight_{$scopeId}");

            Log::debug("Financial cache invalidated for user [{$userId}] (Scope: [{$scopeId}]). Version incremented.");
        } catch (\Exception $e) {
            Log::error("Failed to invalidate financial cache for user [{$userId}]: ".$e->getMessage());
        }
    }
}
