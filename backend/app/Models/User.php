<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

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
        ];
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $url = (config('app.frontend_url') ?? 'http://localhost:5173') . '/reset-password?token=' . $token . '&email=' . $this->email;
        $this->notify(new \Illuminate\Auth\Notifications\ResetPassword($url));
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        // We wrap the default notification to use our frontend URL
        $originalUrl = \Illuminate\Support\Facades\URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(config('auth.verification.expire', 60)),
            [
                'id' => $this->getKey(),
                'hash' => sha1($this->getEmailForVerification()),
            ]
        );

        $frontendUrl = (config('app.frontend_url') ?? 'http://localhost:5173') . '/verify-email?url=' . urlencode($originalUrl);
        
        // You might need a custom notification to send this specific URL
        // For simplicity, we can use a custom notification or just Log it for now if we don't want to create too many files.
        // But let's stay standard.
        $this->notify(new class($frontendUrl) extends \Illuminate\Auth\Notifications\VerifyEmail {
            public $url;
            public function __construct($url) { $this->url = $url; }
            protected function verificationUrl($notifiable) { return $this->url; }
        });
    }
}
