<?php

namespace Illuminate\Cache\Events;

class CacheLocksFlushFailed
{
    /**
     * The name of the cache store.
     */
    public ?string $storeName;

    /**
     * Create a new event instance.
     */
    public function __construct(?string $storeName)
    {
        $this->storeName = $storeName;
    }
}
