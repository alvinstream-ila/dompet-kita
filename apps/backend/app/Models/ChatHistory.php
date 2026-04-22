<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\HasHouseholdScope;

class ChatHistory extends Model
{
    use HasHouseholdScope;

    protected $fillable = [
        'user_id',
        'household_id',
        'role',
        'content',
        'metadata',
    ];

    /**
     * Get the user that owns the chat history.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }
}
