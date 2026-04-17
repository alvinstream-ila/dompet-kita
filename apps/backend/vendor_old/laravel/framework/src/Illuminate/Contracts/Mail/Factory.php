<?php

namespace Illuminate\Contracts\Mail;

interface Factory
{
    /**
     * Get a mailer instance by name.
     *
     * @param  \UnitEnum|string|null  $name
     * @return Mailer
     */
    public function mailer($name = null);
}
