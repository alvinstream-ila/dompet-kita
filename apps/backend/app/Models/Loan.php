<?php

namespace App\Models;

use App\Enums\LoanStatus;
use App\Enums\LoanType;
use App\Traits\HasUserScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property float $amount
 * @property float $remaining_amount
 * @property string|null $description
 * @property string $contact_name
 * @property Carbon|null $due_date
 * @property string $status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property float $total // Dynamic field
 */
class Loan extends Model
{
    use HasUserScope, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['type', 'amount', 'remaining_amount', 'contact_name', 'due_date'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'type',
        'amount',
        'remaining_amount',
        'description',
        'contact_name',
        'due_date',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => LoanType::class,
            'status' => LoanStatus::class,
            'amount' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
            'due_date' => 'date',
            'description' => 'encrypted',
        ];
    }

    /**
     * Get the user that owns the loan.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User, $this>
     */
    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
