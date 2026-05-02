<?php

declare(strict_types=1);

namespace App\Actions\Finance\Transaction;

use App\Actions\BaseAction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DeleteTransactionAction extends BaseAction
{
    public function execute(User $user, Transaction $transaction): bool
    {


        return (bool) DB::transaction(function () use ($transaction) {
            return $transaction->delete();
        });
    }
}
