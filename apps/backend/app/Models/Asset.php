<?php

namespace App\Models;

use App\Enums\AssetType;
use App\Traits\AccountingJournalist;
use App\Traits\HasHouseholdScope;
use Carbon\Carbon;
use Database\Factories\AssetFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property string $user_id
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
    /** @use HasFactory<AssetFactory> */
    use AccountingJournalist, HasFactory, HasHouseholdScope, LogsActivity, SoftDeletes;

    protected $fillable = [
        'user_id',
        'household_id',
        'name',
        'type',
        'currency',
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
     * @return HasMany<AssetTransaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(AssetTransaction::class);
    }

    /**
     * @return HasMany<AssetPriceHistory, $this>
     */
    public function priceHistories(): HasMany
    {
        return $this->hasMany(AssetPriceHistory::class);
    }

    /**
     * @return HasOne<AssetPriceHistory, $this>
     */
    public function previousDayPrice(): HasOne
    {
        return $this->hasOne(AssetPriceHistory::class)
            ->whereDate('recorded_at', '<', now()->toDateString())
            ->latestOfMany('recorded_at');
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

        // Use eager-loaded relationship if available
        $previousRecord = $this->relationLoaded('previousDayPrice')
            ? $this->previousDayPrice
            : $this->previousDayPrice()->first();

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
            'currency' => 'string',
            'value' => 'decimal:4',
            'quantity' => 'decimal:18',
            'is_market_synced' => 'boolean',
            'last_synced_at' => 'datetime',
            'invested_capital' => 'decimal:4',
        ];
    }
}
