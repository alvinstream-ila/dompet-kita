<?php

namespace App\Models;

use App\Enums\TransactionType;
use App\Services\BudgetService;
use App\Traits\HasHouseholdScope;
use Carbon\Carbon;
use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $user_id
 * @property string $household_id
 * @property Carbon $date
 * @property float $amount
 * @property string $category
 * @property string|null $sub_category
 * @property TransactionType $type
 * @property string|null $description
 * @property string|null $note
 * @property string|null $receipt_url
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property int|null $asset_id
 * @property array<string, mixed>|null $metadata
 * @property float $total // Dynamic field for aggregate queries
 */
class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory, HasHouseholdScope, LogsActivity;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'household_id',
        'amount',
        'type',
        'category',
        'description',
        'note',
        'date',
        'receipt_url',
        'is_ai_generated',
        'metadata',
        'asset_id',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['amount', 'category', 'type', 'date'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    /**
     * @return BelongsTo<Asset, $this>
     */
    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    /**
     * Scope to filter transactions by month and year based on budget cycle.
     *
     * @param  Builder<Transaction>  $query
     * @return Builder<Transaction>
     */
    public function scopeFilterByPeriod($query, ?int $month, ?int $year, int $startDay = 1)
    {
        if (! $month || ! $year) {
            return $query;
        }

        $budgetService = app(BudgetService::class);
        $dates = $budgetService->getBudgetCycleDates($month, $year, $startDay);

        return $query->whereBetween('date', [$dates['start'], $dates['end']]);
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
            'date' => 'date',
            'is_ai_generated' => 'boolean',
            'metadata' => 'array',
            'type' => TransactionType::class,
            'amount' => 'decimal:2',
        ];
    }
}
