<?php

namespace App\Models;

use Database\Factories\PartnerInvitationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerInvitation extends Model
{
    /** @use HasFactory<PartnerInvitationFactory> */
    use HasFactory;

    protected $fillable = [
        'inviter_id',
        'email',
        'token',
        'status',
        'expires_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'status' => 'string',
        ];
    }

    /**
     * Get the user who sent the invitation.
     */
    public function inviter()
    {
        return $this->belongsTo(User::class, 'inviter_id');
    }
}
