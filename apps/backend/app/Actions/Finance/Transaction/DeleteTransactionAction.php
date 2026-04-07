<?php

namespace App\Actions\Finance\Transaction;

use App\Actions\BaseAction;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DeleteTransactionAction extends BaseAction
{
    use ClearsTransactionCache;

    public function execute(User $user, Transaction $transaction): bool
    {
        return DB::transaction(function () use ($user, $transaction) {
            $date = Carbon::parse($transaction->date);

            $deleted = $transaction->delete();

            $this->clearTransactionCache($user, $date);

            return $deleted;
        });
    }
}
