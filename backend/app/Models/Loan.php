<?php

namespace App\Models;

use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use App\Traits\HasUserScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Loan extends Model
{
    use HasUserScope, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['type', 'amount', 'remaining_amount', 'contact_name', 'due_date'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

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

    protected $casts = [
        'amount' => 'float',
        'remaining_amount' => 'float',
        'due_date' => 'datetime',
    ];
}
