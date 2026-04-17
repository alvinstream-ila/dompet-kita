<?php

namespace Illuminate\Console\Events;

use Illuminate\Console\Scheduling\Event;

class ScheduledBackgroundTaskFinished
{
    /**
     * Create a new event instance.
     *
     * @param  Event  $task  The scheduled event that ran.
     */
    public function __construct(
        public Event $task,
    ) {}
}
