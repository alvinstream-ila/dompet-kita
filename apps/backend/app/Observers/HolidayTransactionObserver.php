<?php

namespace App\Observers;

use App\Models\Holiday;
use App\Models\HolidayTransaction;

class HolidayTransactionObserver
{
    /**
     * Handle the HolidayTransaction "created" event.
     */
    public function created(HolidayTransaction $transaction): void
    {
        $this->syncHolidayBalance($transaction, 'add');
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
    }

    /**
     * Handle the HolidayTransaction "deleted" event.
     */
    public function deleted(HolidayTransaction $transaction): void
    {
        $this->syncHolidayBalance($transaction, 'remove');
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
}
