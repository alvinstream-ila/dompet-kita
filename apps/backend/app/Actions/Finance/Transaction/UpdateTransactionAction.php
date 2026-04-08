<?php

namespace App\Actions\Finance\Transaction;

use App\Actions\BaseAction;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class UpdateTransactionAction extends BaseAction
{
    use ClearsTransactionCache;

    /**
     * @param array<string, mixed> $data
     */
    public function execute(User $user, Transaction $transaction, array $data): Transaction
    {
        return DB::transaction(function () use ($user, $transaction, $data) {
            $oldDate = Carbon::parse($transaction->getOriginal('date') ?? $transaction->date);
            $this->clearTransactionCache($user, $oldDate);

            $transaction->update($data);
            $transaction->refresh();

            $newDate = Carbon::parse($transaction->date);
            $this->clearTransactionCache($user, $newDate);

            return $transaction;
        });
    }
}
