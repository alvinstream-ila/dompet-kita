<?php

namespace Akaunting\Firewall\Tests\Feature;

use Akaunting\Firewall\Middleware\Lfi;
use Akaunting\Firewall\Tests\TestCase;

class LfiTest extends TestCase
{
    public function test_should_allow()
    {
        $this->assertEquals('next', (new Lfi)->handle($this->app->request, $this->getNextClosure()));
    }

    public function test_should_block()
    {
        $this->app->request->query->set('foo', '../../../../etc/passwd');

        $this->assertEquals('403', (new Lfi)->handle($this->app->request, $this->getNextClosure())->getStatusCode());
    }
}
