<?php

namespace App\Traits;

use App\Enums\TransactionType;
use App\Models\Transaction;
use Carbon\Carbon;

/**
 * Trait AccountingJournalist
 * Standardized logic for creating automatic dashboard (Hot Money) ledger entries.
 *
 * @property int $id
 * @property int $user_id
 */
trait AccountingJournalist
{
    /**
     * Record a transaction to the main dashboard ledger.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function recordJournal(
        float $amount,
        TransactionType $type,
        string $category,
        string $description,
        ?Carbon $date = null,
        array $metadata = []
    ): Transaction {
        return Transaction::create([
            'user_id' => $this->user_id,
            'amount' => abs($amount),
            'type' => $type,
            'category' => $category,
            'description' => $description,
            'date' => $date ?? now(),
            'metadata' => array_merge($metadata, [
                'auto_journal' => true,
                'source_type' => static::class,
                'source_id' => $this->id,
            ]),
        ]);
    }
}
