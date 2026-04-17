<?php

namespace Illuminate\Contracts\Cache;

interface Factory
{
    /**
     * Get a cache store instance by name.
     *
     * @param  \UnitEnum|string|null  $name
     * @return Repository
     */
    public function store($name = null);
}
