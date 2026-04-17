<?php

namespace Illuminate\Auth\Events;

use Illuminate\Http\Request;

class Lockout
{
    /**
     * The throttled request.
     *
     * @var Request
     */
    public $request;

    /**
     * Create a new event instance.
     */
    public function __construct(Request $request)
    {
        $this->request = $request;
    }
}
