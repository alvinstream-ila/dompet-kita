<?php

namespace App\Observers;

use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Notifications\LargeExpenseNotification;
use Illuminate\Support\Facades\Cache;

class TransactionObserver
{
    /**
     * Handle the Transaction "created" event.
     */
    public function created(Transaction $transaction): void
    {
        $this->invalidateUserCache($transaction);

        $user = $transaction->user;
        if (! $user) {
            return;
        }

        // Logic check for Large Expense Triggering
        $threshold = $user->large_expense_threshold ?? 1000000;

        if ($transaction->type === TransactionType::EXPENSE &&
            $transaction->amount >= $threshold &&
            $user->partner) {
            $user->partner->notify(new LargeExpenseNotification($transaction, $user));
        }
    }

    /**
     * Handle the Transaction "updated" event.
     */
    public function updated(Transaction $transaction): void
    {
        $this->invalidateUserCache($transaction);
    }

    /**
     * Handle the Transaction "deleted" event.
     */
    public function deleted(Transaction $transaction): void
    {
        $this->invalidateUserCache($transaction);
    }

    /**
     * Invalidate the user dashboard summary cache by incrementing the version.
     */
    private function invalidateUserCache(Transaction $transaction): void
    {
        $userId = $transaction->user_id;
        $versionKey = "transaction_summary_version_{$userId}";

        // Increment the version to effectively "bust" all cached summaries for this user
        Cache::increment($versionKey);
    }
}
