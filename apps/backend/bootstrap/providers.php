<?php

use Akaunting\Firewall\Provider as FirewallServiceProvider;
use App\Providers\AiServiceProvider;
use App\Providers\AppServiceProvider;
use App\Providers\MailServiceProvider;
use Barryvdh\LaravelIdeHelper\IdeHelperServiceProvider;

return [
    AppServiceProvider::class,
    IdeHelperServiceProvider::class,
    AiServiceProvider::class,
    MailServiceProvider::class,
    FirewallServiceProvider::class,
];
