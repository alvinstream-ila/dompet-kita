<?php

namespace Illuminate\Auth\Events;

use Illuminate\Contracts\Auth\CanResetPassword;
use Illuminate\Queue\SerializesModels;

class PasswordResetLinkSent
{
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  CanResetPassword  $user  The user instance.
     */
    public function __construct(
        public $user,
    ) {}
}
