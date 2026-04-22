<?php

namespace App\Observers;

use App\Enums\TransactionType;
use App\Models\GoalTransaction;
use App\Traits\ClearsFinancialCache;

class GoalTransactionObserver
{
    use ClearsFinancialCache;

    /**
     * Handle the GoalTransaction "created" event.
     */
    public function created(GoalTransaction $transaction): void
    {
        // When a user saves money for a dream (Goal), it is recorded as an EXPENSE
        // in the dashboard because that money is now "locked" and not for daily use.
        if ($transaction->type === 'deposit') {
            $transaction->recordJournal(
                (float) $transaction->amount,
                TransactionType::EXPENSE,
                'Impian',
                "Menabung untuk: {$transaction->goal->name}"
            );
        }

        // When a user withdraws money from a dream (Goal), it is recorded as INCOME
        // in the dashboard because the money is returning to the main "Hot Money" balance.
        if ($transaction->type === 'withdrawal') {
            $transaction->recordJournal(
                (float) $transaction->amount,
                TransactionType::INCOME,
                'Impian',
                "Pencairan dari: {$transaction->goal->name}"
            );
        }

        $this->invalidateFinancialCache($transaction->user_id);
    }

    /**
     * Handle the GoalTransaction "updated" event.
     */
    public function updated(GoalTransaction $transaction): void
    {
        $this->invalidateFinancialCache($transaction->user_id);
    }

    /**
     * Handle the GoalTransaction "deleted" event.
     */
    public function deleted(GoalTransaction $transaction): void
    {
        $this->invalidateFinancialCache($transaction->user_id);
    }
}
