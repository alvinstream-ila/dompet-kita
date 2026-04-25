<?php

namespace App\Traits;

use App\Models\Household;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

/**
 * Trait HasHouseholdScope
 * The "Sovereign Multi-Tenant" anchor.
 * Ensures that Alvin & Ila share the same financial reality based on their Household.
 */
trait HasHouseholdScope
{
    /**
     * Define the user relationship.
     * Every record still belongs to a specific user as the "creator".
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Define the household relationship.
     *
     * @return BelongsTo<Household, $this>
     */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * Boot the trait to automatically handle household-based isolation and population.
     */
    protected static function bootHasHouseholdScope(): void
    {
        static::creating(function ($model) {
            $user = Auth::user();

            // 1. If we have an authenticated user, prioritize their context
            if ($user instanceof User) {
                if (! $model->user_id) {
                    $model->user_id = $user->id;
                }

                if (! $model->household_id && $user->household_id) {
                    $model->household_id = $user->household_id;
                }
            }

            // 2. Fallback: If household_id is still missing but user_id is set (e.g. manual assignment or console)
            if (! $model->household_id && $model->user_id) {
                /** @var User|null $owner */
                $owner = User::find($model->user_id);
                if ($owner && $owner->household_id) {
                    $model->household_id = $owner->household_id;
                }
            }
        });

        // 🛡️ The Sovereign Scope: Alvin & Ila see everything in the same household.
        static::addGlobalScope('household_scope', function (Builder $builder) {
            $user = Auth::user();
            if ($user instanceof User) {
                if ($user->household_id) {
                    $builder->where('household_id', $user->household_id);
                } else {
                    // Fallback to personal scope if not in a household
                    $builder->where('user_id', $user->id);
                }
            }
        });
    }
}
