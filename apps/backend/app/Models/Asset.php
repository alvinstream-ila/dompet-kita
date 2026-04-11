<?php

namespace App\Models;

use App\Enums\AssetType;
use App\Traits\HasUserScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property AssetType $type
 * @property float $quantity
 * @property string|null $unit
 * @property bool $is_market_synced
 * @property float $value
 * @property float $invested_capital
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Asset extends Model
{
    use HasUserScope, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'type', 'value', 'invested_capital'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    protected $fillable = [
        'user_id',
        'name',
        'type',
        'quantity',
        'unit',
        'is_market_synced',
        'value',
        'invested_capital',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'name' => 'encrypted',
            'type' => AssetType::class,
            'value' => 'float',
            'quantity' => 'float',
            'is_market_synced' => 'boolean',
            'invested_capital' => 'float',
        ];
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
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<AssetTransaction>
     */
    public function transactions()
    {
        return $this->hasMany(AssetTransaction::class);
    }

    /**
     * Scope for assets that should be synced with market rates.
     *
     * @param  Builder<Asset>  $query
     * @return Builder<Asset>
     */
    public function scopeMarketSynced($query)
    {
        return $query->where('is_market_synced', '=', true);
    }
}
