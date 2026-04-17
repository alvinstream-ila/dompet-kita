<?php

namespace Illuminate\Auth\Events;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Queue\SerializesModels;

class Login
{
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  string  $guard  The authentication guard name.
     * @param  Authenticatable  $user  The authenticated user.
     * @param  bool  $remember  Indicates if the user should be "remembered".
     */
    public function __construct(
        public $guard,
        public $user,
        public $remember,
    ) {}
}
