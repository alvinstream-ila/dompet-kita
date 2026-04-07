<?php

namespace App\Traits;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait HasUserScope
{
    /**
     * Boot the trait to automatically filter by user_id for all Eloquent queries.
     */
    protected static function bootHasUserScope(): void
    {
        static::creating(function ($model) {
            if (! $model->user_id && Auth::check()) {
                $model->user_id = Auth::id();
            }
        });

        static::addGlobalScope('user_scope', function (Builder $builder) {
            if (Auth::check()) {
                $builder->where('user_id', Auth::id());
            }
        });
    }

    /**
     * Define the user relationship (if not already defined).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
