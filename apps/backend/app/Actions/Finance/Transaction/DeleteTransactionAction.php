<?php

declare(strict_types=1);

namespace App\Actions\Finance\Transaction;

use App\Actions\BaseAction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DeleteTransactionAction extends BaseAction
{
    use ClearsTransactionCache;

    public function execute(User $user, Transaction $transaction): bool
    {
        return (bool) DB::transaction(function () use ($user, $transaction) {
            $deleted = $transaction->delete();

            $this->clearTransactionCache($user);

            return $deleted;
        });
    }
}
