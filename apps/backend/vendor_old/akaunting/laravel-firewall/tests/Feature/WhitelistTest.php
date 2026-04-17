<?php

namespace Akaunting\Firewall\Tests\Feature;

use Akaunting\Firewall\Middleware\Whitelist;
use Akaunting\Firewall\Tests\TestCase;

class WhitelistTest extends TestCase
{
    public function test_should_allow()
    {
        config(['firewall.whitelist' => ['127.0.0.0/24']]);

        $this->assertEquals('next', (new Whitelist)->handle($this->app->request, $this->getNextClosure()));
    }

    public function test_should_block()
    {
        $this->assertEquals('403', (new Whitelist)->handle($this->app->request, $this->getNextClosure())->getStatusCode());
    }
}
