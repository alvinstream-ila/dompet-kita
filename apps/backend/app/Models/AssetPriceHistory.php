<?php

namespace App\Models;

use App\Traits\HasHouseholdScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $user_id
 * @property string $household_id
 * @property int $asset_id
 * @property float $price
 * @property Carbon $recorded_at
 */
class AssetPriceHistory extends Model
{
    use HasHouseholdScope;

    protected $fillable = [
        'user_id',
        'household_id',
        'asset_id',
        'price',
        'recorded_at',
    ];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Asset, $this>
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * @return array<string, string>
     */
    #[\Override]
    protected function casts(): array
    {
        return [
            'price' => 'decimal:8',
            'recorded_at' => 'datetime',
        ];
    }
}
