<?php

namespace App\Observers;

use App\Models\Holiday;
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

        $this->invalidateFinancialCache($transaction->household_id ?? (string) $transaction->user_id);
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

        $this->invalidateFinancialCache($transaction->household_id ?? (string) $transaction->user_id);
    }

    /**
     * Handle the HolidayTransaction "deleted" event.
     */
    public function deleted(HolidayTransaction $transaction): void
    {
        $this->syncHolidayBalance($transaction, 'remove');
        $this->syncHolidayJournal($transaction); // This will remove the journal

        $this->invalidateFinancialCache($transaction->household_id ?? (string) $transaction->user_id);
    }

    /**
     * Updates the Holiday balance (funded_amount and spent).
     */
    protected function syncHolidayBalance(HolidayTransaction $transaction, string $action, ?float $customAmount = null, ?string $customType = null): void
    {
        $amount = $customAmount ?? (float) $transaction->amount;
        $type = $customType ?? $transaction->type;

        $holidayId = ($action === 'remove' && $transaction->wasChanged('holiday_id'))
            ? $transaction->getOriginal('holiday_id')
            : $transaction->holiday_id;

        $holiday = Holiday::where('id', $holidayId)->lockForUpdate()->first();

        if (! $holiday) {
            return;
        }

        $column = ($type === 'funding') ? 'funded_amount' : 'spent';

        if ($action === 'add') {
            $holiday->increment($column, $amount);
        } else { // remove
            $holiday->decrement($column, $amount);
        }
    }

    /**
     * Synchronizes the journal based on transaction type.
     */
    protected function syncHolidayJournal(HolidayTransaction $transaction): void
    {
        if ($transaction->type === 'funding') {
            // Ensure holiday relationship is loaded
            $holiday = $transaction->holiday ?: Holiday::find($transaction->holiday_id);
            $destination = $holiday ? $holiday->destination : 'Liburan';

            // When funding a holiday, it is recorded as an EXPENSE
            // because that money is now "locked" for the trip.
            $transaction->syncJournal(
                'holiday_transaction',
                (float) $transaction->amount,
                \App\Enums\TransactionType::EXPENSE,
                'Liburan',
                "Penyisihan Dana Liburan: {$destination}",
                $transaction->transaction_date
            );
        } elseif ($transaction->type === 'spending') {
            // When spending from the holiday fund, we might record it as an expense too
            // or just a descriptive record. For now, let's keep it as an expense
            // but usually, it's already "spent" from the main balance when funded.
            // If the user is spending money that was ALREADY funded, we don't want to double count.
            // However, if they fund and spend simultaneously (e.g. paying direct), it should be recorded.
            
            // Logic: If it's a direct expense (not from funded amount), it should be a journal entry.
            // But usually, HolidayTransaction is used for tracking the fund itself.
            // Let's remove any existing journal for non-funding types to avoid confusion.
            $transaction->removeJournal('holiday_transaction');
        } else {
            $transaction->removeJournal('holiday_transaction');
        }
    }
}
