<?php

namespace App\Actions\Finance\Transaction;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

trait ClearsTransactionCache
{
    protected function clearTransactionCache(User $user): void
    {
        $userIds = [$user->id];

        // 🏠 Household Sync: Invalidate for everyone in the household
        if ($user->household_id) {
            $userIds = User::where('household_id', $user->household_id)->pluck('id')->toArray();
        }

        foreach ($userIds as $id) {
            Cache::increment("transaction_summary_version_{$id}");
        }

        // Clear household-level AI insights
        $scopeId = $user->household_id ?? $user->id;
        Cache::forget("ai_insight_{$scopeId}");
    }
}
