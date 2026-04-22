<?php

namespace App\Policies;

use App\Models\TransactionInsight;
use App\Models\User;

class TransactionInsightPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->exists;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, TransactionInsight $insight): bool
    {
        return $insight->household_id && $user->household_id
            ? $user->household_id === $insight->household_id
            : $user->id === $insight->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->exists;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, TransactionInsight $insight): bool
    {
        return $insight->household_id && $user->household_id
            ? $user->household_id === $insight->household_id
            : $user->id === $insight->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, TransactionInsight $insight): bool
    {
        return $insight->household_id && $user->household_id
            ? $user->household_id === $insight->household_id
            : $user->id === $insight->user_id;
    }
}
