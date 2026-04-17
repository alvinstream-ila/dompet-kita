<?php

namespace Illuminate\Bus\Events;

use Illuminate\Bus\Batch;

class BatchStarted
{
    /**
     * Create a new event instance.
     *
     * @param  Batch  $batch  The batch instance.
     */
    public function __construct(
        public Batch $batch,
    ) {}
}
