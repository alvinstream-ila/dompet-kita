<?php

namespace App\Models;

use App\Enums\AssetType;
use App\Traits\AccountingJournalist;
use App\Traits\HasHouseholdScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $user_id
 * @property string $household_id
 * @property string $name
 * @property AssetType $type
 * @property float $quantity
 * @property string|null $unit
 * @property bool $is_market_synced
 * @property float $value
 * @property float $invested_capital
 * @property Carbon|null $last_synced_at
 * @property-read float $change_24h
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Asset extends Model
{
    use AccountingJournalist, HasHouseholdScope, LogsActivity;

    protected $fillable = [
        'user_id',
        'household_id',
        'name',
        'type',
        'quantity',
        'unit',
        'is_market_synced',
        'last_synced_at',
        'value',
        'invested_capital',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'type', 'value', 'invested_capital'])
            ->logOnlyDirty();
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The transactions associated with this asset.
     *
     * @return HasMany<AssetTransaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(AssetTransaction::class);
    }

    /**
     * The price history of this asset.
     *
     * @return HasMany<AssetPriceHistory, $this>
     */
    public function priceHistories(): HasMany
    {
        return $this->hasMany(AssetPriceHistory::class);
    }

    /**
     * Scope for assets that should be synced with market rates.
     *
     * @param  Builder<Asset>  $query
     * @return Builder<Asset>
     */
    public function scopeMarketSynced($query)
    {
        return $query->where('is_market_synced', true);
    }

    /**
     * Calculate 24h price trend based on historical data.
     */
    public function getChange24hAttribute(): float
    {
        $currentPrice = $this->quantity > 0 ? $this->value / $this->quantity : 0;

        // Get the latest history record before today
        $previousRecord = $this->priceHistories()
            ->whereDate('recorded_at', '<', now()->toDateString())
            ->orderByDesc('recorded_at')
            ->first();

        if (! $previousRecord || $previousRecord->price <= 0) {
            return 0.0;
        }

        return round(($currentPrice - $previousRecord->price) / $previousRecord->price * 100, 2);
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
            'type' => AssetType::class,
            'value' => 'float',
            'quantity' => 'float',
            'is_market_synced' => 'boolean',
            'last_synced_at' => 'datetime',
            'invested_capital' => 'float',
        ];
    }
}
