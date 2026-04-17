<?php

namespace Illuminate\Auth\Events;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Queue\SerializesModels;

class Verified
{
    use SerializesModels;

    /**
     * Create a new event instance.
     *
     * @param  MustVerifyEmail  $user  The verified user.
     */
    public function __construct(
        public $user,
    ) {}
}
