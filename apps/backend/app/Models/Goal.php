<?php

namespace App\Models;

use App\Traits\AccountingJournalist;
use App\Traits\HasHouseholdScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $user_id
 * @property string $household_id
 * @property string $name
 * @property float $target_amount
 * @property float $current_amount
 * @property Carbon|null $deadline
 * @property string $category
 * @property string $status
 * @property string|null $icon
 */
class Goal extends Model
{
    use AccountingJournalist, HasFactory, HasHouseholdScope;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'household_id',
        'name',
        'target_amount',
        'current_amount',
        'deadline',
        'category',
        'status',
        'icon',
    ];

    /**
     * Get the transactions for this goal.
     *
     * @return HasMany<GoalTransaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(GoalTransaction::class);
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
            'name' => 'encrypted',
            'target_amount' => 'decimal:2',
            'current_amount' => 'decimal:2',
            'deadline' => 'date',
        ];
    }
}
