<?php

namespace App\Actions\Finance\Transaction;

use App\Actions\BaseAction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpdateTransactionAction extends BaseAction
{
    use ClearsTransactionCache;

    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, Transaction $transaction, array $data): Transaction
    {
        return DB::transaction(function () use ($user, $transaction, $data): \App\Models\Transaction {
            $this->clearTransactionCache($user);

            $transaction->update($data);
            $transaction->refresh();

            $this->clearTransactionCache($user);

            return $transaction;
        });
    }
}
