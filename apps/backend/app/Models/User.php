<?php

namespace App\Models;

use App\Notifications\VerifyEmailNotification;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property string $id
 * @property string $name
 * @property string $email
 * @property string|null $tax_status
 * @property int|null $dependents_count
 * @property string|null $industry_sector
 * @property Carbon|null $last_active_at
 * @property Carbon|null $legacy_grace_start_at
 * @property int|null $legacy_threshold_months
 * @property bool $is_legacy_triggered
 * @property string|null $partner_id
 * @property User|null $partner
 * @property string|null $household_id
 * @property Household|null $household
 * @property int|null $budget_cycle_start
 * @property int|null $large_expense_threshold
 * @property int|null $monthly_budget_limit
 * @property string|null $email_verification_code
 * @property Carbon|null $email_verification_expires_at
 * @property string|null $otp_reset_code
 * @property Carbon|null $otp_reset_expires_at
 * @property bool $two_factor_enabled
 * @property string|null $two_factor_code
 * @property Carbon|null $two_factor_expires_at
 * @property Carbon|null $email_verified_at
 * @property-read Collection<int, Asset> $assets
 * @property-read Collection<int, Loan> $loans
 * @property-read Collection<int, LegacyVaultReport> $reports
 * @property-read Collection<int, LoginHistory> $sessions
 */
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasUuids, LogsActivity, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'last_active_at',
        'legacy_threshold_months',
        'is_legacy_triggered',
        'legacy_grace_start_at',
        'legacy_partner_name',
        'legacy_partner_email',
        'partner_id',
        'household_id',
        'large_expense_threshold',
        'monthly_budget_limit',
        'tax_status',
        'dependents_count',
        'industry_sector',
        'email_verification_code',
        'email_verification_expires_at',
        'otp_reset_code',
        'otp_reset_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_code',
        'otp_reset_code',
        'email_verification_code',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'partner_id', 'two_factor_enabled'])
            ->logOnlyDirty();
    }

    /**
     * @return HasMany<LoginHistory, $this>
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(LoginHistory::class);
    }

    /**
     * @return HasMany<Asset, $this>
     */
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    /**
     * @return HasMany<Loan, $this>
     */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    /**
     * @return HasMany<LegacyVaultReport, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(LegacyVaultReport::class);
    }

    /**
     * @return BelongsTo<Household, $this>
     */
    public function household(): BelongsTo
    {
        return $this->belongsTo(Household::class);
    }

    /**
     * Send the email verification notification overriding Laravel default.
     */
    #[\Override]
    public function sendEmailVerificationNotification(): void
    {
        $code = (string) random_int(100000, 999999);

        $this->update([
            'email_verification_code' => Hash::make($code),
            'email_verification_expires_at' => now()->addMinutes(60),
        ]);

        Log::info('USER-NOTIFICATION: Triggering VerifyEmailNotification for user: '.$this->email);
        $this->notify(new VerifyEmailNotification($code));
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
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_active_at' => 'datetime',
            'legacy_grace_start_at' => 'datetime',
            'is_legacy_triggered' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'two_factor_expires_at' => 'datetime',
            'otp_reset_expires_at' => 'datetime',
            'household_id' => 'string',
        ];
    }
}
