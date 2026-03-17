<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Loan extends Model
{
    use HasFactory, HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'type',
        'amount',
        'remaining_amount',
        'description',
        'contact_name',
        'due_date',
        'status',
        'user_id',
    ];

    protected $casts = [
        'amount' => 'double',
        'remaining_amount' => 'double',
        'due_date' => 'datetime',
        'created_at' => 'datetime',
    ];
}
