<?php

namespace App\Models;

use App\Traits\HasHouseholdScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PartnerInvitation extends Model
{
    use HasHouseholdScope;

    protected $fillable = [
        'inviter_id',
        'household_id',
        'email',
        'token',
        'status',
        'expires_at',
    ];

    /**
     * Get the user who sent the invitation.
     */
    /** @return BelongsTo<User, $this> */
    public function inviter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inviter_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    #[\Override]
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'status' => 'string',
        ];
    }
}
