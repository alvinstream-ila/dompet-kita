<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\AccountingJournalist;
use App\Traits\HasHouseholdScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $household_id
 * @property int $goal_id
 * @property int|null $asset_id
 * @property float $amount
 * @property string $type
 * @property string|null $description
 * @property Carbon $date
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Goal $goal
 * @property-read Asset|null $asset
 */
class GoalTransaction extends Model
{
    use AccountingJournalist, HasHouseholdScope;

    protected $fillable = [
        'user_id',
        'household_id',
        'goal_id',
        'asset_id',
        'amount',
        'type',
        'description',
        'date',
    ];

    /** @return BelongsTo<Goal, $this> */
    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }

    /** @return BelongsTo<Asset, $this> */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    #[\Override]
    protected function casts(): array
    {
        return [
            'date' => 'datetime',
            'amount' => 'decimal:2',
        ];
    }
}
