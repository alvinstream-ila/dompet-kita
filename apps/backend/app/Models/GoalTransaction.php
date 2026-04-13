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
 * @property int $goal_id
 * @property int|null $asset_id
 * @property float $amount
 * @property string $type
 * @property string|null $description
 * @property Carbon $date
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class GoalTransaction extends Model
{
    use HasUserScope;

    protected $fillable = [
        'user_id',
        'goal_id',
        'asset_id',
        'amount',
        'type',
        'description',
        'date',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'datetime',
            'amount' => 'decimal:2',
        ];
    }

    /** @return \Illuminate\Database\Eloquent\Relations\BelongsTo<Goal, $this> */
    public function goal(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Goal::class);
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
