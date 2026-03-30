<?php

namespace App\Models;

use App\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Goal extends Model
{
    use HasUserScope;

    protected $fillable = [
        'user_id',
        'name',
        'target_amount',
        'current_amount',
        'deadline',
        'category',
        'status',
    ];

    protected $casts = [
        'target_amount' => 'float',
        'current_amount' => 'float',
        'deadline' => 'datetime',
    ];
}
