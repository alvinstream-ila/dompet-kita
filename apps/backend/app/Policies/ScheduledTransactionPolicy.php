<?php

namespace App\Policies;

use App\Models\ScheduledTransaction;
use App\Models\User;

class ScheduledTransactionPolicy
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
    public function view(User $user, ScheduledTransaction $scheduledTransaction): bool
    {
        return $scheduledTransaction->household_id && $user->household_id
            ? $user->household_id === $scheduledTransaction->household_id
            : $user->id === $scheduledTransaction->user_id;
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
    public function update(User $user, ScheduledTransaction $scheduledTransaction): bool
    {
        return $scheduledTransaction->household_id && $user->household_id
            ? $user->household_id === $scheduledTransaction->household_id
            : $user->id === $scheduledTransaction->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ScheduledTransaction $scheduledTransaction): bool
    {
        return $scheduledTransaction->household_id && $user->household_id
            ? $user->household_id === $scheduledTransaction->household_id
            : $user->id === $scheduledTransaction->user_id;
    }
}
