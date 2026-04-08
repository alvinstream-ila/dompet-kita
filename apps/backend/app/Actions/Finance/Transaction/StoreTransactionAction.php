<?php

namespace App\Actions\Finance\Transaction;

use App\Actions\BaseAction;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class StoreTransactionAction extends BaseAction
{
    use ClearsTransactionCache;

    /**
     * @param array<string, mixed> $data
     */
    public function execute(User $user, array $data): Transaction
    {
        $data['user_id'] = $user->id;

        return DB::transaction(function () use ($user, $data) {
            $transaction = Transaction::create($data);

            $this->clearTransactionCache($user, Carbon::parse($transaction->date));

            return $transaction;
        });
    }
}
