<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Holiday extends Model
{
    protected $fillable = [
        'user_id',
        'destination',
        'budget',
        'start_date',
        'end_date',
        'status',
        'spent',
        'itinerary',
    ];

    protected $casts = [
        'budget' => 'float',
        'spent' => 'float',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
