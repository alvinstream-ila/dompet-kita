<?php

namespace App\Models;

use App\Enums\RecurrenceFrequency;
use App\Enums\ScheduleStatus;
use App\Enums\TransactionType;
use App\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property int $user_id
 * @property string $description
 * @property float $amount
 * @property TransactionType $type
 * @property string $category
 * @property RecurrenceFrequency $recurrence
 * @property \Illuminate\Support\Carbon $next_due_date
 * @property ScheduleStatus $status
 * @property bool $is_auto_execute
 * @property \Illuminate\Support\Carbon|null $last_executed_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property \Illuminate\Support\Carbon $updated_at
 *
 * @method static \Illuminate\Database\Eloquent\Builder|ScheduledTransaction active()
 * @method static \Illuminate\Database\Eloquent\Builder|ScheduledTransaction due()
 * @method static \Illuminate\Database\Eloquent\Builder|ScheduledTransaction query()
 */
class ScheduledTransaction extends Model
{
    use HasUserScope, HasUuids;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'description',
        'amount',
        'type',
        'category',
        'recurrence',
        'next_due_date',
        'status',
        'is_auto_execute',
        'last_executed_at',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'next_due_date' => 'date',
            'is_auto_execute' => 'boolean',
            'last_executed_at' => 'datetime',
            'type' => TransactionType::class,
            'recurrence' => RecurrenceFrequency::class,
            'status' => ScheduleStatus::class,
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
     * @param  Builder<ScheduledTransaction>  $query
     * @return Builder<ScheduledTransaction>
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * @param  Builder<ScheduledTransaction>  $query
     * @return Builder<ScheduledTransaction>
     */
    public function scopeDue($query)
    {
        return $query->where('next_due_date', '<=', now()->toDateString());
    }
}
