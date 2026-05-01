<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasHouseholdScope;
use Database\Factories\TransactionInsightFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property int $user_id
 * @property string $household_id
 * @property string $type
 * @property string $title
 * @property string $content
 * @property string|null $status
 * @property string|null $action_url
 * @property array<string, mixed>|null $metadata
 */
class TransactionInsight extends Model
{
    /** @use HasFactory<TransactionInsightFactory> */
    use HasFactory, HasHouseholdScope, HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'household_id',
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
    #[\Override]
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'impact_value' => 'decimal:2',
        ];
    }
}
