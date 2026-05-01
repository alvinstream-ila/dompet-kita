<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\HasHouseholdScope;

class LegacyVaultReport extends Model
{
    use HasHouseholdScope;

    protected $fillable = [
        'user_id',
        'household_id',
        'filename',
        'storage_path',
        'disk',
        'summary_data',
        'is_claimed',
        'claimed_at',
        'purge_at',
    ];

    protected $casts = [
        'summary_data' => 'array',
        'is_claimed' => 'boolean',
        'claimed_at' => 'datetime',
        'purge_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
