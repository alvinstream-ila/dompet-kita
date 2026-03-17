<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Holiday extends Model
{
    use HasFactory, HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'destination',
        'budget',
        'start_date',
        'end_date',
        'status',
    ];

    protected $casts = [
        'budget' => 'double',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'created_at' => 'datetime',
    ];
}
