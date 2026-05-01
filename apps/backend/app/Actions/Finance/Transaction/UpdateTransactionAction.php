<?php

declare(strict_types=1);

namespace App\Actions\Finance\Transaction;

use App\Actions\BaseAction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpdateTransactionAction extends BaseAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, Transaction $transaction, array $data): Transaction
    {
        // 🛡️ Defense in Depth: Ensure transaction belongs to user's household
        abort_unless($transaction->household_id === $user->household_id, 403, 'Anda tidak memiliki akses ke transaksi ini.');

        return DB::transaction(function () use ($transaction, $data): Transaction {
            $transaction->update($data);
            $transaction->refresh();

            return $transaction;
        });
    }
}
