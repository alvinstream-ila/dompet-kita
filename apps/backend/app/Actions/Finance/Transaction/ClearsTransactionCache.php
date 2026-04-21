<?php

namespace App\Actions\Finance\Transaction;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

trait ClearsTransactionCache
{
    protected function clearTransactionCache(User $user, Carbon $date): void
    {
        $budgetCycleStart = $user->budget_cycle_start ?? 1;

        // 1. Clear generic and AI keys
        Cache::forget("ai_insight_{$user->id}");
        Cache::forget("transaction_summary_{$user->id}_all_all_{$budgetCycleStart}");

        // 2. Clear current month index
        $monthIndex = $date->month - 1;
        Cache::forget("transaction_summary_{$user->id}_{$monthIndex}_{$date->year}_{$budgetCycleStart}");

        /**
         * 3. Proactive "Cycle-Aware" Invalidation 🛰️
         * If the cycle starts NOT on the 1st, a transaction date could affect
         * the summary of the "previous" or "next" month index depending on how
         * the budget cycle is queried. We clear the neighboring months for safety.
         */
        if ($budgetCycleStart !== 1) {
            $prevMonth = $date->copy()->subMonth();
            Cache::forget("transaction_summary_{$user->id}_".($prevMonth->month - 1)."_{$prevMonth->year}_{$budgetCycleStart}");

            $nextMonth = $date->copy()->addMonth();
            Cache::forget("transaction_summary_{$user->id}_".($nextMonth->month - 1)."_{$nextMonth->year}_{$budgetCycleStart}");
        }
    }
}
