<?php

namespace App\Observers;

use App\Enums\TransactionType;
use App\Models\Asset;
use App\Models\Transaction;
use App\Notifications\LargeExpenseNotification;
use App\Traits\ClearsFinancialCache;
use Illuminate\Support\Facades\DB;

class TransactionObserver
{
    use ClearsFinancialCache;

    /**
     * Handle the Transaction "created" event.
     */
    public function created(Transaction $transaction): void
    {
        $this->invalidateFinancialCache($transaction->user_id);

        if ($transaction->asset_id) {
            $this->adjustAssetBalance($transaction, $transaction->amount);
        }

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

        // Handle Asset balance changes if amount, type, or asset_id changed
        if ($transaction->wasChanged(['amount', 'type', 'asset_id'])) {
            DB::transaction(function () use ($transaction): void {
                // 1. Reverse old transaction effect
                $oldAssetId = $transaction->getOriginal('asset_id');
                $oldAmount = (float) $transaction->getOriginal('amount');
                $oldType = $transaction->getOriginal('type');

                if ($oldAssetId) {
                    $oldAsset = Asset::find($oldAssetId);
                    if ($oldAsset instanceof Asset) {
                        $this->reverseAssetAdjustment($oldAsset, $oldAmount, $oldType);
                    }
                }

                // 2. Apply new transaction effect
                if ($transaction->asset_id) {
                    $transaction->refresh(); // Ensure we have latest asset relation
                    $this->adjustAssetBalance($transaction, (float) $transaction->amount);
                }
            });
        }
    }

    /**
     * Handle the Transaction "deleted" event.
     */
    public function deleted(Transaction $transaction): void
    {
        $this->invalidateFinancialCache($transaction->user_id);

        if ($transaction->asset_id) {
            $this->reverseAssetAdjustment($transaction->asset, $transaction->amount, $transaction->type);
        }
    }

    /**
     * Adjust asset balance based on transaction.
     */
    private function adjustAssetBalance(Transaction $transaction, float $amount): void
    {
        $asset = $transaction->asset;
        if (! $asset) {
            return;
        }

        $isIncome = $transaction->type === TransactionType::INCOME;

        if ($isIncome) {
            $asset->increment('value', $amount);
        } else {
            $asset->decrement('value', $amount);
        }
    }

    /**
     * Reverse an asset adjustment.
     */
    private function reverseAssetAdjustment(?Asset $asset, float $amount, mixed $type): void
    {
        if (! $asset) {
            return;
        }

        // Type could be Enum or string from getOriginal
        $isIncome = $type instanceof TransactionType
            ? $type === TransactionType::INCOME
            : $type === TransactionType::INCOME->value;

        if ($isIncome) {
            $asset->decrement('value', $amount);
        } else {
            $asset->increment('value', $amount);
        }
    }
}
