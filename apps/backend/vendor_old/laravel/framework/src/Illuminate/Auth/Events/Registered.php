<?php

namespace Illuminate\Auth\Events;

use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Queue\SerializesModels;

class Registered
{
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  Authenticatable  $user  The authenticated user.
     */
    public function __construct(
        public $user,
    ) {}
}
