<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Asset extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false; // Supabase uses last_updated instead of standard timestamps

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'value',
        'last_updated',
    ];

    protected $casts = [
        'value' => 'double',
        'last_updated' => 'datetime',
    ];
}
