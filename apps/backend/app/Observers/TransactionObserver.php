<?php

namespace App\Observers;

use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Notifications\LargeExpenseNotification;
use App\Traits\ClearsFinancialCache;
use Illuminate\Support\Facades\Cache;

class TransactionObserver
{
    use ClearsFinancialCache;

    /**
     * Handle the Transaction "created" event.
     */
    public function created(Transaction $transaction): void
    {
        $this->invalidateFinancialCache($transaction->user_id);

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
        $this->invalidateFinancialCache($transaction->user_id);
    }

    /**
     * Handle the Transaction "deleted" event.
     */
    public function deleted(Transaction $transaction): void
    {
        $this->invalidateFinancialCache($transaction->user_id);
    }
}
