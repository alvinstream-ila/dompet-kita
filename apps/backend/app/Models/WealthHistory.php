<?php

namespace App\Models;

use App\Traits\HasHouseholdScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $household_id
 * @property int $month
 * @property int $year
 * @property float $total_value
 */
class WealthHistory extends Model
{
    /** @use \Illuminate\Database\Eloquent\Factories\HasFactory<\Database\Factories\WealthHistoryFactory> */
    use HasFactory, HasHouseholdScope;

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

    /**
     * @phpstan-return BelongsTo<User, covariant WealthHistory>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    #[\Override]
    protected function casts(): array
    {
        return [
            'total_value' => 'encrypted:decimal:2',
            'month' => 'integer',
            'year' => 'integer',
        ];
    }
}
