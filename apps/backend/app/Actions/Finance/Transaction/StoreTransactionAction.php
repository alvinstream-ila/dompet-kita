<?php

declare(strict_types=1);

namespace App\Actions\Finance\Transaction;

use App\Actions\BaseAction;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StoreTransactionAction extends BaseAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(User $user, array $data): Transaction
    {
        $data['user_id'] = $user->id;
        $data['household_id'] = $user->household_id;

        return DB::transaction(function () use ($data) {
            return Transaction::create($data);
        });
    }
}
