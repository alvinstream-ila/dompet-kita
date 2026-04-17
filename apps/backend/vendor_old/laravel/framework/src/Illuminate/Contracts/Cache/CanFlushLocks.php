<?php

namespace Illuminate\Contracts\Cache;

interface CanFlushLocks
{
    /**
     * Flush all locks managed by the store.
     */
    public function flushLocks(): bool;

    /**
     * Determine if the lock store is separate from the cache store.
     */
    public function hasSeparateLockStore(): bool;
}
