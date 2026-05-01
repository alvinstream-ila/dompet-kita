<?php

declare(strict_types=1);

namespace App\Actions\Finance;

use App\Actions\BaseAction;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class ManageLoanAction extends BaseAction
{
    /**
     * Record a new loan.
     *
     * @param  array<string, mixed>  $data
     */
    public function record(User $user, array $data): Loan
    {
        // 🛡️ Sovereign Security Gate: Explicitly allow only specific fields
        $payload = [
            'user_id' => $user->id,
            'household_id' => $user->household_id,
            'name' => $data['name'] ?? 'Unnamed Loan',
            'amount' => (float) ($data['amount'] ?? 0.0),
            'interest_rate' => (float) ($data['interest_rate'] ?? 0.0),
            'due_date' => $data['due_date'] ?? null,
            'status' => 'pending', // Always start as pending
            'type' => $data['type'] ?? 'debt',
        ];

        return Loan::create($payload);
    }

    /**
     * List all loans for a user.
     * A user MUST be provided — never returns global data.
     *
     * @return Collection<int, Loan>
     */
    public function list(User $user): Collection
    {
        $query = Loan::query();
        if ($user->household_id) {
            $query->where('household_id', $user->household_id);
        } else {
            $query->where('user_id', $user->id);
        }

        return $query->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Mark a loan as paid.
     */
    public function markAsPaid(User $user, int $id): bool
    {
        $query = Loan::query();

        if ($user->household_id) {
            $query->where('household_id', $user->household_id);
        } else {
            $query->where('user_id', $user->id);
        }

        $loan = $query->findOrFail($id);

        return $loan->update(['status' => 'paid']);
    }
}
