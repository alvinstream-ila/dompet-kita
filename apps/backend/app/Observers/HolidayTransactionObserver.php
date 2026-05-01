<?php

namespace App\Observers;

use App\Enums\TransactionType;
use App\Models\HolidayTransaction;
use App\Traits\ClearsFinancialCache;

class HolidayTransactionObserver
{
    use ClearsFinancialCache;

    /**
     * Handle the HolidayTransaction "created" event.
     */
    public function created(HolidayTransaction $transaction): void
    {
        $this->syncHolidayBalance($transaction, 'add');
        $this->syncHolidayJournal($transaction);

        $this->invalidateFinancialCache($transaction->user_id);
    }

    /**
     * Handle the HolidayTransaction "updated" event.
     */
    public function updated(HolidayTransaction $transaction): void
    {
        // 1. Rollback old amount
        $oldAmount = $transaction->getOriginal('amount');
        $oldType = $transaction->getOriginal('type');
        $this->syncHolidayBalance($transaction, 'remove', (float) $oldAmount, (string) $oldType);

        // 2. Apply new amount
        $this->syncHolidayBalance($transaction, 'add');

        $this->syncHolidayJournal($transaction);

        $this->invalidateFinancialCache($transaction->user_id);
    }

    /**
     * Handle the HolidayTransaction "deleted" event.
     */
    public function deleted(HolidayTransaction $transaction): void
    {
        $this->syncHolidayBalance($transaction, 'remove');

        $this->invalidateFinancialCache($transaction->user_id);
    }

    /**
     * Updates the Holiday balance fields (funded_amount or spent).
     */
    protected function syncHolidayBalance(HolidayTransaction $transaction, string $action, ?float $customAmount = null, ?string $customType = null): void
    {
        $amount = $customAmount ?? (float) $transaction->amount;
        $type = $customType ?? $transaction->type;
        $holiday = $transaction->holiday;

        if (! $holiday) {
            return;
        }

        $column = $type === 'funding' ? 'funded_amount' : 'spent';

        if ($action === 'add') {
            $holiday->increment($column, $amount);
        } else { // remove
            $holiday->decrement($column, $amount);
        }
    }

    /**
     * Synchronize the journal entry for the transaction.
     */
    protected function syncHolidayJournal(HolidayTransaction $transaction): void
    {
        // When a user funds a holiday (type: funding), it is recorded as an EXPENSE
        // in the dashboard because that money is now "locked" for travel.
        if ($transaction->type === 'funding') {
            $transaction->syncJournal(
                'holiday_funding',
                (float) $transaction->amount,
                TransactionType::EXPENSE,
                'Liburan',
                "Menabung untuk liburan ke: {$transaction->holiday->destination}",
                $transaction->transaction_date
            );
        } else {
            // Note: 'expense' or 'spending' types inside this module are NOT recorded
            // in the main dashboard ledger because the money was already deducted
            // during the funding phase (pre-paid logic).
            $transaction->removeJournal('holiday_funding');
        }
    }
}
