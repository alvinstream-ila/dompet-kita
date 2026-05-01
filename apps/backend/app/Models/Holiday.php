<?php

namespace App\Models;

use App\Traits\HasHouseholdScope;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $household_id
 * @property string $destination
 * @property float $budget
 * @property float $funded_amount
 * @property Carbon|null $start_date
 * @property Carbon|null $end_date
 * @property string $status
 * @property float $spent
 * @property string|null $itinerary
 * @property string|null $image_url
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Holiday extends Model
{
    use HasFactory, HasHouseholdScope;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'household_id',
        'destination',
        'budget',
        'funded_amount',
        'start_date',
        'end_date',
        'status',
        'spent',
        'itinerary',
        'image_url',
    ];

    /**
     * Get the transactions for the holiday.
     *
     * @return HasMany<HolidayTransaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(HolidayTransaction::class);
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
            'budget' => 'decimal:2',
            'funded_amount' => 'decimal:2',
            'spent' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }
}
