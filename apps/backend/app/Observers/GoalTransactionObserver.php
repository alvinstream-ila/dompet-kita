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
        $this->syncGoalBalance($transaction, 'add');
        $this->syncGoalJournal($transaction);

        $this->invalidateFinancialCache($transaction->user_id);
    }

    /**
     * Handle the GoalTransaction "updated" event.
     */
    public function updated(GoalTransaction $transaction): void
    {
        // 1. Rollback old amount
        $oldAmount = $transaction->getOriginal('amount');
        $oldType = $transaction->getOriginal('type');
        $this->syncGoalBalance($transaction, 'remove', (float) $oldAmount, (string) $oldType);

        // 2. Apply new amount
        $this->syncGoalBalance($transaction, 'add');

        $this->syncGoalJournal($transaction);

        $this->invalidateFinancialCache($transaction->user_id);
    }

    /**
     * Handle the GoalTransaction "deleted" event.
     */
    public function deleted(GoalTransaction $transaction): void
    {
        $this->syncGoalBalance($transaction, 'remove');

        $this->invalidateFinancialCache($transaction->user_id);
    }

    /**
     * Updates the Goal balance.
     */
    protected function syncGoalBalance(GoalTransaction $transaction, string $action, ?float $customAmount = null, ?string $customType = null): void
    {
        $amount = $customAmount ?? (float) $transaction->amount;
        $type = $customType ?? $transaction->type;
        
        // 🛡️ Fix 62: If we are removing (rolling back), we must check if the goal_id was changed.
        // If it was, we need to affect the ORIGINAL goal, not the current one.
        $goalId = ($action === 'remove' && $transaction->wasChanged('goal_id'))
            ? $transaction->getOriginal('goal_id')
            : $transaction->goal_id;

        $goal = \App\Models\Goal::where('id', $goalId)->lockForUpdate()->first();

        if (! $goal) {
            return;
        }

        if ($action === 'add') {
            if ($type === 'deposit') {
                $goal->increment('current_amount', $amount);
            } elseif ($type === 'withdrawal') {
                $goal->decrement('current_amount', $amount);
            }
        } else { // remove
            if ($type === 'deposit') {
                $goal->decrement('current_amount', $amount);
            } elseif ($type === 'withdrawal') {
                $goal->increment('current_amount', $amount);
            }
        }
    }

    /**
     * Synchronizes the journal based on transaction type.
     */
    protected function syncGoalJournal(GoalTransaction $transaction): void
    {
        // When a user saves money for a dream (Goal), it is recorded as an EXPENSE
        // in the dashboard because that money is now "locked" and not for daily use.
        if ($transaction->type === 'deposit') {
            $transaction->syncJournal(
                'goal_transaction',
                (float) $transaction->amount,
                TransactionType::EXPENSE,
                'Impian',
                "Menabung untuk: {$transaction->goal->name}",
                $transaction->date
            );
        } elseif ($transaction->type === 'withdrawal') {
            // When a user withdraws money from a dream (Goal), it is recorded as INCOME
            // in the dashboard because the money is returning to the main "Hot Money" balance.
            $transaction->syncJournal(
                'goal_transaction',
                (float) $transaction->amount,
                TransactionType::INCOME,
                'Impian',
                "Pencairan dari: {$transaction->goal->name}",
                $transaction->date
            );
        } else {
            $transaction->removeJournal('goal_transaction');
        }
    }
}
