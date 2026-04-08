<?php

namespace App\Models;

use App\Notifications\VerifyEmailNotification;
use Carbon\Carbon;
use Database\Factories\UserFactory;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\URL;
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
 * @property Carbon $created_at
 * @property Carbon $updated_at
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
        'email_verified_at',
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
        ];
    }

    /* Relationships */

    public function partner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'partner_id');
    }

    /**
     * Get the assets for the user.
     */
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    /**
     * Get the transactions for the user.
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the goals for the user.
     */
    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    /**
     * Get the loans for the user.
     */
    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class);
    }

    /**
     * Get the scheduled transactions for the user.
     */
    public function scheduledTransactions(): HasMany
    {
        return $this->hasMany(ScheduledTransaction::class);
    }

    /**
     * Get the chat history for the user.
     */
    public function chatHistories(): HasMany
    {
        return $this->hasMany(ChatHistory::class);
    }

    /**
     * Get the financial wisdoms for the user.
     */
    public function financialWisdoms(): HasMany
    {
        return $this->hasMany(FinancialWisdom::class);
    }

    /**
     * Get the wealth histories for the user.
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
        $url = (\config('app.frontend_url') ?? 'http://localhost:5173').'/reset-password?token='.$token.'&email='.$this->email;
        $this->notify(new ResetPassword($url));
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $originalUrl = URL::temporarySignedRoute(
            'verification.verify',
            \now()->addMinutes(\config('auth.verification.expire', 60)),
            [
                'id' => $this->getKey(),
                'hash' => sha1($this->getEmailForVerification()),
            ]
        );

        $frontendUrl = (\config('app.frontend_url') ?? 'https://dompet-kita-six.vercel.app').'/verify-email?url='.urlencode($originalUrl);

        $this->notify(new VerifyEmailNotification($frontendUrl));
    }
}
