<?php

namespace App\Traits;

use App\Enums\TransactionType;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Trait AccountingJournalist
 * Standardized logic for creating automatic dashboard (Hot Money) ledger entries.
 *
 * @property int $id
 * @property int $user_id
 *
 * @mixin Model
 */
trait AccountingJournalist
{
    /**
     * Record a new transaction to the main dashboard ledger.
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
            'household_id' => $this->household_id ?? null,
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

    /**
     * Sync (update or create) a journal entry with a specific context.
     *
     * @param  array<string, mixed>  $metadata
     */
    public function syncJournal(
        string $context,
        float $amount,
        TransactionType $type,
        string $category,
        string $description,
        ?Carbon $date = null,
        array $metadata = []
    ): Transaction {
        $query = Transaction::query();

        if ($this->household_id) {
            $query->where('household_id', $this->household_id);
        } else {
            $query->where('user_id', $this->user_id);
        }

        $transactions = $query->where('metadata->source_type', static::class)
            ->where('metadata->source_id', $this->id)
            ->get();

        // Find exact context match, or fallback to the legacy one (which has no context yet)
        /** @var Transaction|null $transaction */
        $transaction = $transactions->first(function (Transaction $t) use ($context) {
            return isset($t->metadata['journal_context']) && $t->metadata['journal_context'] === $context;
        })
            ?? $transactions->first(function (Transaction $t) {
                return ! isset($t->metadata['journal_context']);
            });

        $mergedMetadata = array_merge($transaction ? ($transaction->metadata ?? []) : [], $metadata, [
            'auto_journal' => true,
            'source_type' => static::class,
            'source_id' => $this->id,
            'journal_context' => $context,
        ]);

        if ($transaction) {
            $transaction->update([
                'amount' => abs($amount),
                'type' => $type,
                'category' => $category,
                'description' => $description,
                'date' => $date ?? $transaction->date,
                'metadata' => $mergedMetadata,
            ]);

            return $transaction;
        }

        return Transaction::create([
            'user_id' => $this->user_id,
            'household_id' => $this->household_id ?? null,
            'amount' => abs($amount),
            'type' => $type,
            'category' => $category,
            'description' => $description,
            'date' => $date ?? now(),
            'metadata' => $mergedMetadata,
        ]);
    }

    /**
     * Removes a specific auto-journal associated with this source and context.
     */
    public function removeJournal(string $context): void
    {
        $query = Transaction::query();

        if ($this->household_id) {
            $query->where('household_id', $this->household_id);
        } else {
            $query->where('user_id', $this->user_id);
        }

        $query->where('metadata->source_type', static::class)
            ->where('metadata->source_id', $this->id)
            ->where('metadata->journal_context', $context)
            ->delete();
    }

    /**
     * Boot the trait to automatically clean up journals when the parent is deleted.
     */
    protected static function bootAccountingJournalist(): void
    {
        static::deleted(function ($model): void {
            $query = Transaction::query();

            if ($model->household_id) {
                $query->where('household_id', $model->household_id);
            } else {
                $query->where('user_id', $model->user_id);
            }

            $query->where('metadata->source_type', get_class($model))
                ->where('metadata->source_id', $model->id)
                ->delete();
        });
    }
}
