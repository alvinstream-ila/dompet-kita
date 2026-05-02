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
     * Optional override for CLI/Job contexts where Auth::user() is missing.
     */
    protected static ?string $forcedHouseholdId = null;

    /**
     * Force a specific household ID for the current process (CLI/Jobs).
     */
    public static function setForcedHouseholdId(?string $id): void
    {
        static::$forcedHouseholdId = $id;

        if ($id && function_exists('activity')) {
            \Illuminate\Support\Facades\Log::info("Administrative Scope Override: Household scope forced to [{$id}] for model [" . static::class . "].");
            
            activity('sentinel')
                ->withProperties([
                    'forced_id' => $id,
                    'model' => static::class,
                    'context' => php_sapi_name(),
                ])
                ->log("Sovereign Audit: Administrative household scope override activated.");
        }
    }

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
        static::creating(function ($model): void {
            // Priority 1: Use forced household ID if set (CLI/Jobs)
            if (static::$forcedHouseholdId) {
                $model->household_id = static::$forcedHouseholdId;
            }

            $user = Auth::user();

            // Priority 2: Use authenticated user's context
            if ($user instanceof User) {
                if (! $model->user_id) {
                    $model->user_id = $user->id;
                }

                if (! $model->household_id && $user->household_id) {
                    $model->household_id = $user->household_id;
                }
            }

            // Priority 3: Fallback based on user_id if already set
            if (! $model->household_id && $model->user_id) {
                /** @var User|null $owner */
                $owner = User::find($model->user_id);
                if ($owner && $owner->household_id) {
                    $model->household_id = $owner->household_id;
                }
            }

            // 🛡️ Integrity Check: Every multi-tenant model MUST have a household_id
            if (! $model->household_id) {
                throw new \RuntimeException("Critical Breach: Attempted to create record for model [" . static::class . "] without a household scope.");
            }
        });

        // 🛡️ The Sovereign Scope: Alvin & Ila see everything in the same household.
        static::addGlobalScope('household_scope', function (Builder $builder): void {
            // 1. Check forced scope first (CLI/Jobs)
            if (static::$forcedHouseholdId) {
                $builder->where('household_id', static::$forcedHouseholdId);
                return;
            }

            $user = Auth::user();
            if ($user instanceof User) {
                if ($user->household_id) {
                    $builder->where('household_id', $user->household_id);
                } else {
                    // Fallback to personal scope if not in a household
                    $builder->where('user_id', $user->id);
                }
            } else {
                // 🛡️ Security Lockdown: If no authenticated context or forced scope exists, deny access.
                $builder->whereRaw('1 = 0');
            }
        });
    }
}
