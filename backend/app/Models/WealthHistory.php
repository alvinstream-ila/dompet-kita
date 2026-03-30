<?php

namespace App\Models;

use App\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WealthHistory extends Model
{
    use HasUserScope;

    protected $fillable = [
        'user_id',
        'month',
        'year',
        'total_value',
    ];
}
