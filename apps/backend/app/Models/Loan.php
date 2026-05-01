<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\LoanStatus;
use App\Enums\LoanType;
use App\Traits\AccountingJournalist;
use App\Traits\HasHouseholdScope;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $user_id
 * @property string $household_id
 * @property LoanType $type
 * @property float $amount
 * @property float $remaining_amount
 * @property string|null $description
 * @property string $contact_name
 * @property Carbon|null $due_date
 * @property LoanStatus $status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property float $total // Dynamic field
 */
class Loan extends Model
{
    use AccountingJournalist, HasFactory, HasHouseholdScope, LogsActivity;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'household_id',
        'type',
        'amount',
        'remaining_amount',
        'description',
        'contact_name',
        'due_date',
        'status',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['type', 'amount', 'remaining_amount', 'contact_name', 'due_date'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
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
            'type' => LoanType::class,
            'status' => LoanStatus::class,
            'amount' => 'decimal:2',
            'remaining_amount' => 'decimal:2',
            'due_date' => 'date',
            'description' => 'encrypted',
        ];
    }
}
