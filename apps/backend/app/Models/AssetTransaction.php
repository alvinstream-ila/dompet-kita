<?php

namespace App\Models;

use App\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AssetTransaction extends Model
{
    use HasUserScope;

    protected $fillable = [
        'user_id',
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
    /** @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Asset, $this> */
    public function asset(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * The source asset (for transfers).
     */
    /** @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Asset, $this> */
    public function sourceAsset(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Asset::class, 'source_asset_id');
    }

    /**
     * The user who owns this transaction.
     */
    /** @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User, $this> */
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
