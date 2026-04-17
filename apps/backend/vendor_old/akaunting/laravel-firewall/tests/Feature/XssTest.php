<?php

namespace Akaunting\Firewall\Tests\Feature;

use Akaunting\Firewall\Middleware\Xss;
use Akaunting\Firewall\Tests\TestCase;

class XssTest extends TestCase
{
    public function test_should_allow()
    {
        $this->assertEquals('next', (new Xss)->handle($this->app->request, $this->getNextClosure()));
    }

    public function test_should_block()
    {
        $this->app->request->query->set('foo', '<script>alert(123)</script>');

        $this->assertEquals('403', (new Xss)->handle($this->app->request, $this->getNextClosure())->getStatusCode());
    }
}
