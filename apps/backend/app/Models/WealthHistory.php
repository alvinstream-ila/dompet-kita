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

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_value' => 'decimal:2',
            'month' => 'integer',
            'year' => 'integer',
        ];
    }

    /**
     * Get the user that owns the wealth history.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
