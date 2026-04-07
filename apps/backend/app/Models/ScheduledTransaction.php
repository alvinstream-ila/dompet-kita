<?php

namespace App\Models;

use App\Enums\RecurrenceFrequency;
use App\Enums\ScheduleStatus;
use App\Enums\TransactionType;
use App\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScheduledTransaction extends Model
{
    use HasFactory, HasUserScope, HasUuids;

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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeDue($query)
    {
        return $query->where('next_due_date', '<=', now()->toDateString());
    }
}
