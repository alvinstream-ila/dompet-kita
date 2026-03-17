<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Goal extends Model
{
    use HasFactory, HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'name',
        'target_amount',
        'current_amount',
        'deadline',
        'category',
        'icon',
        'status',
        'user_id',
    ];

    protected $casts = [
        'target_amount' => 'double',
        'current_amount' => 'double',
        'deadline' => 'datetime',
        'created_at' => 'datetime',
    ];
}
