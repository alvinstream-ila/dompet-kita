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
     */
    public function record(User $user, array $data): Loan
    {
        $data['user_id'] = $user->id;
        $data['status'] = $data['status'] ?? 'pending';

        return Loan::create($data);
    }

    /**
     * List all loans.
     */
    public function list(?User $user = null): Collection
    {
        $query = Loan::orderBy('created_at', 'desc');
        if ($user) {
            $query->where('user_id', $user->id);
        }

        return $query->get();
    }

    /**
     * Mark a loan as paid.
     */
    public function markAsPaid(int $id): bool
    {
        $loan = Loan::findOrFail($id);

        return $loan->update(['status' => 'paid']);
    }
}
