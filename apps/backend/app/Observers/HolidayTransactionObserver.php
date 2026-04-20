<?php

namespace App\Observers;

use App\Enums\TransactionType;
use App\Models\HolidayTransaction;

class HolidayTransactionObserver
{
    /**
     * Handle the HolidayTransaction "created" event.
     */
    public function created(HolidayTransaction $transaction): void
    {
        // When a user funds a holiday (type: funding), it is recorded as an EXPENSE
        // in the dashboard because that money is now "locked" for travel.
        if ($transaction->type === 'funding') {
            $transaction->recordJournal(
                (float) $transaction->amount,
                TransactionType::EXPENSE,
                'Liburan',
                "Menabung untuk liburan ke: {$transaction->holiday->destination}"
            );
        }

        // Note: 'expense' or 'spending' types inside this module are NOT recorded
        // in the main dashboard ledger because the money was already deducted
        // during the funding phase (pre-paid logic).
    }
}
