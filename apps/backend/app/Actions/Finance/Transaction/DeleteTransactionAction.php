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
        // 🛡️ Defense in Depth: Ensure transaction belongs to user's household
        abort_unless($transaction->household_id === $user->household_id, 403, 'Anda tidak memiliki akses ke transaksi ini.');

        return (bool) DB::transaction(function () use ($transaction) {
            return $transaction->delete();
        });
    }
}
