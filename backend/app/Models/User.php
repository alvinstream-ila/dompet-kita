<?php

namespace App\Models;

use App\Notifications\VerifyEmailNotification;
use Database\Factories\UserFactory;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\URL;
use Laravel\Sanctum\HasApiTokens;

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
            'social_id' => 'encrypted',
            'anniversary_date' => 'date',
            'budget_cycle_start' => 'integer',
            'is_privacy_mode' => 'boolean',
            'is_eco_mode' => 'boolean',
            'exchange_rate' => 'float',
            'monthly_budget_limit' => 'float',
            'partner_name' => 'encrypted',
        ];
    }

    /* Relationships */

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function assets()
    {
        return $this->hasMany(Asset::class);
    }

    public function goals()
    {
        return $this->hasMany(Goal::class);
    }

    public function loans()
    {
        return $this->hasMany(Loan::class);
    }

    public function holidays()
    {
        return $this->hasMany(Holiday::class);
    }

    public function wealthHistories()
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
        $url = (config('app.frontend_url') ?? 'http://localhost:5173').'/reset-password?token='.$token.'&email='.$this->email;
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
            now()->addMinutes(config('auth.verification.expire', 60)),
            [
                'id' => $this->getKey(),
                'hash' => sha1($this->getEmailForVerification()),
            ]
        );

        $frontendUrl = (config('app.frontend_url') ?? 'https://dompet-kita-six.vercel.app').'/verify-email?url='.urlencode($originalUrl);

        $this->notify(new VerifyEmailNotification($frontendUrl));
    }
}
