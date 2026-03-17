<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Transaction extends Model
{
    use HasFactory, HasUuids;

    /**
     * Correcting timestamps to match Supabase's non-standard naming or handling.
     * Supabase uses created_at by default. Laravel uses created_at and updated_at.
     */
    const UPDATED_AT = null;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'date',
        'amount',
        'category',
        'sub_category',
        'type',
        'description',
        'note',
        'receipt_url',
        'user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date' => 'datetime',
        'amount' => 'double',
        'created_at' => 'datetime',
    ];
}
