<?php

namespace Illuminate\Auth\Events;

use Illuminate\Contracts\Auth\Authenticatable;

class Failed
{
    /**
     * Create a new event instance.
     *
     * @param  string  $guard  The authentication guard name.
     * @param  Authenticatable|null  $user  The user the attempter was trying to authenticate as.
     * @param  array  $credentials  The credentials provided by the attempter.
     */
    public function __construct(
        public $guard,
        public $user,
        #[\SensitiveParameter] public $credentials,
    ) {}
}
