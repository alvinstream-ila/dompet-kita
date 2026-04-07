<?php

namespace App\Observers;

use App\Enums\TransactionType;
use App\Models\Transaction;
use App\Notifications\LargeExpenseNotification;

class TransactionObserver
{
    /**
     * Handle the Transaction "created" event.
     */
    public function created(Transaction $transaction): void
    {
        $user = $transaction->user;

        if (!$user) {
            return;
        }

        // Logic check for Large Expense Triggering
        // 1. Must be an EXPENSE
        // 2. Amount must meet or exceed the user threshold (defaulting to a sensible 1,000,000 if not set)
        $threshold = $user->large_expense_threshold ?? 1000000;

        if ($transaction->type === TransactionType::EXPENSE &&
            $transaction->amount >= $threshold &&
            $user->partner) {
            $user->partner->notify(new LargeExpenseNotification($transaction, $user));
        }
    }

    // Future logic for updated/deleted events can be added here
}
