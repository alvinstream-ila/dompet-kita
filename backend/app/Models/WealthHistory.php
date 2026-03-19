<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WealthHistory extends Model
{
    protected $fillable = [
        'user_id',
        'month',
        'year',
        'total_value'
    ];

    /**
     * Get the user that owns the wealth history record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
