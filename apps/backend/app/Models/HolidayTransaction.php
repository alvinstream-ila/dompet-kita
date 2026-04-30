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
 * @property int $holiday_id
 * @property int|null $asset_id
 * @property float $amount
 * @property string $type
 * @property string|null $description
 * @property Carbon $transaction_date
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property-read Holiday $holiday
 * @property-read Asset|null $asset
 */
class HolidayTransaction extends Model
{
    use AccountingJournalist, HasHouseholdScope;

    protected $fillable = [
        'user_id',
        'household_id',
        'holiday_id',
        'asset_id',
        'amount',
        'type',
        'description',
        'transaction_date',
    ];

    /** @return BelongsTo<Holiday, $this> */
    public function holiday(): BelongsTo
    {
        return $this->belongsTo(Holiday::class);
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
            'transaction_date' => 'date',
            'amount' => 'decimal:2',
        ];
    }
}
