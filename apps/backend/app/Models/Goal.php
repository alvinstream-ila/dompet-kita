<?php

namespace App\Models;

use App\Traits\HasUserScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $user_id
 * @property string $name
 * @property float $target_amount
 * @property float $current_amount
 * @property Carbon|null $deadline
 * @property string $category
 * @property string $status
 * @property string|null $icon
 */
class Goal extends Model
{
    use HasUserScope;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'target_amount',
        'current_amount',
        'deadline',
        'category',
        'status',
        'icon',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'name' => 'encrypted',
            'target_amount' => 'decimal:2',
            'current_amount' => 'decimal:2',
            'deadline' => 'date',
        ];
    }

    /**
     * Get the user that owns the goal.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User, $this>
     */
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the transactions for this goal.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<GoalTransaction, $this>
     */
    public function transactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(GoalTransaction::class);
    }
}
