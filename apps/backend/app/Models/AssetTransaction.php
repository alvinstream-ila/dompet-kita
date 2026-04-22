<?php

namespace App\Models;

use App\Traits\HasHouseholdScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetTransaction extends Model
{
    use HasHouseholdScope;

    protected $fillable = [
        'user_id',
        'household_id',
        'asset_id',
        'source_asset_id',
        'amount',
        'type',
        'description',
        'transaction_date',
    ];

    protected $casts = [
        'amount' => 'float',
        'transaction_date' => 'datetime',
    ];

    /**
     * The asset this transaction belongs to.
     */
    /** @return BelongsTo<Asset, $this> */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * The source asset (for transfers).
     */
    /** @return BelongsTo<Asset, $this> */
    public function sourceAsset(): BelongsTo
    {
        return $this->belongsTo(Asset::class, 'source_asset_id');
    }
}
