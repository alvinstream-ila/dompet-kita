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
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, Transaction $transaction, array $data): Transaction
    {
        return DB::transaction(function () use ($user, $transaction, $data) {
            $oldDateVal = $transaction->getOriginal('date') ?? $transaction->date;
            $oldDate = Carbon::parse((string) $oldDateVal);
            $this->clearTransactionCache($user, $oldDate);

            $transaction->update($data);
            $transaction->refresh();

            $newDate = Carbon::parse((string) $transaction->date);
            $this->clearTransactionCache($user, $newDate);

            return $transaction;
        });
    }
}
