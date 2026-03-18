<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Loan extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'remaining_amount',
        'description',
        'contact_name',
        'due_date',
        'status',
    ];

    protected $casts = [
        'amount' => 'float',
        'remaining_amount' => 'float',
        'due_date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
