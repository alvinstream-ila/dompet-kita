<?php

namespace App\Models;

use App\Traits\HasUserScope;
use Database\Factories\TransactionInsightFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionInsight extends Model
{
    /** @use HasFactory<TransactionInsightFactory> */
    use HasFactory, HasUserScope, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'content',
        'impact_value',
        'status',
        'action_url',
        'metadata',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'impact_value' => 'decimal:2',
        ];
    }

    /**
     * Get the user that owns the insight.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
