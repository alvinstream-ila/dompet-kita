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

        Cache::forget("ai_insight_{$user->id}");
        Cache::forget("transaction_summary_{$user->id}_all_all_{$budgetCycleStart}");
        Cache::forget("transaction_summary_{$user->id}_{$date->month}_{$date->year}_{$budgetCycleStart}");
    }
}
