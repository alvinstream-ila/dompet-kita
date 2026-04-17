<?php

namespace Illuminate\Console\Events;

use Illuminate\Console\Application;

class ArtisanStarting
{
    /**
     * Create a new event instance.
     *
     * @param  Application  $artisan  The Artisan application instance.
     */
    public function __construct(
        public Application $artisan,
    ) {}
}
