<?php

namespace App\Models;

use App\Notifications\ResetPasswordOTPNotification;
use App\Notifications\VerifyEmailNotification;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property string|null $full_name
 * @property string|null $avatar_url
 * @property string|null $partner_name
 * @property Carbon|null $anniversary_date
 * @property string $timezone
 * @property int $budget_cycle_start
 * @property bool $is_privacy_mode
 * @property bool $is_eco_mode
 * @property string $currency_format
 * @property float $exchange_rate
 * @property float $monthly_budget_limit
 * @property int $legacy_threshold_months
 * @property bool $is_legacy_triggered
 * @property int|null $partner_id
 * @property float|null $large_expense_threshold
 * @property User|null $partner
 * @property Carbon|null $last_active_at
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property string $password
 * @property string|null $email_verification_code
 * @property Carbon|null $email_verification_expires_at
 * @property bool $two_factor_enabled
 * @property string|null $two_factor_code
 * @property Carbon|null $two_factor_expires_at
 * @property string|null $otp_reset_code
 * @property Carbon|null $otp_reset_expires_at
 *
 * @method static \Database\Factories\UserFactory factory(...$parameters)
 * @method static \Illuminate\Database\Eloquent\Builder|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 */
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'social_id',
        'social_type',
        'full_name',
        'avatar_url',
        'partner_name',
        'anniversary_date',
        'timezone',
        'budget_cycle_start',
        'is_privacy_mode',
        'is_eco_mode',
        'currency_format',
        'exchange_rate',
        'monthly_budget_limit',
        'partner_id',
        'large_expense_threshold',
        'two_factor_enabled',
        'two_factor_code',
        'two_factor_expires_at',
        'email_verification_code',
        'email_verification_expires_at',
        'email_verified_at',
        'otp_reset_code',
        'otp_reset_expires_at',
        'last_active_at',
        'legacy_threshold_months',
        'is_legacy_triggered',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /* Relationships */

    /**
     * Get the partner for the user.
     *
     * @return BelongsTo<User, $this>
     */
    public function partner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    /**
     * Get the assets for the user.
     *
     * @return HasMany<Asset, $this>
     */
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    /**
     * Get the transactions for the user.
     *
     * @return HasMany<Transaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the goals for the user.
     *
     * @return HasMany<Goal, $this>
     */
    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    /**
     * Get the loans for the user.
     *
     * @return HasMany<Loan, $this>
     */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    /**
     * Get the scheduled transactions for the user.
     *
     * @return HasMany<ScheduledTransaction, $this>
     */
    public function scheduledTransactions(): HasMany
    {
        return $this->hasMany(ScheduledTransaction::class);
    }

    /**
     * Get the chat history for the user.
     *
     * @return HasMany<ChatHistory, $this>
     */
    public function chatHistories(): HasMany
    {
        return $this->hasMany(ChatHistory::class);
    }

    /**
     * Get the financial wisdoms for the user.
     *
     * @return HasMany<FinancialWisdom, $this>
     */
    public function financialWisdoms(): HasMany
    {
        return $this->hasMany(FinancialWisdom::class);
    }

    /**
     * Get the wealth histories for the user.
     *
     * @return HasMany<WealthHistory, $this>
     */
    public function wealthHistories(): HasMany
    {
        return $this->hasMany(WealthHistory::class);
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $code = (string) random_int(100000, 999999);

        $this->update([
            'otp_reset_code' => $code,
            'otp_reset_expires_at' => now()->addMinutes(30),
        ]);

        $this->notify(new ResetPasswordOTPNotification($code));
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $code = (string) random_int(100000, 999999);

        $this->update([
            'email_verification_code' => $code,
            'email_verification_expires_at' => now()->addMinutes(60),
        ]);

        $this->notify(new VerifyEmailNotification($code));
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'social_id' => 'string',
            'social_type' => 'string',
            'anniversary_date' => 'date',
            'budget_cycle_start' => 'integer',
            'is_privacy_mode' => 'boolean',
            'is_eco_mode' => 'boolean',
            'exchange_rate' => 'float',
            'monthly_budget_limit' => 'float',
            'large_expense_threshold' => 'float',
            'partner_id' => 'integer',
            'full_name' => 'encrypted',
            'partner_name' => 'encrypted',
            'last_active_at' => 'datetime',
            'legacy_threshold_months' => 'integer',
            'is_legacy_triggered' => 'boolean',
            'two_factor_enabled' => 'boolean',
            'two_factor_expires_at' => 'datetime',
            'email_verification_expires_at' => 'datetime',
            'otp_reset_expires_at' => 'datetime',
        ];
    }
}
