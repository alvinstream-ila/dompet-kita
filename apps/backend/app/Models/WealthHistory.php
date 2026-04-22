<?php

namespace App\Models;

use App\Traits\HasHouseholdScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WealthHistory extends Model
{
    use HasHouseholdScope;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'household_id',
        'month',
        'year',
        'total_value',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

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
}
