<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasUserScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $holiday_id
 * @property int|null $asset_id
 * @property float $amount
 * @property string $type
 * @property string|null $description
 * @property Carbon $transaction_date
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class HolidayTransaction extends Model
{
    use HasUserScope;

    protected $fillable = [
        'user_id',
        'holiday_id',
        'asset_id',
        'amount',
        'type',
        'description',
        'transaction_date',
    ];

    protected function casts(): array
    {
        return [
            'transaction_date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    /** @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Holiday, $this> */
    public function holiday(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Holiday::class);
    }

    /** @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Asset, $this> */
    public function asset(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /** @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User, $this> */
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
