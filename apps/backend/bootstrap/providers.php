<?php

use App\Providers\AiServiceProvider;
use App\Providers\AppServiceProvider;
use App\Providers\MailServiceProvider;
use Barryvdh\LaravelIdeHelper\IdeHelperServiceProvider;
use L5Swagger\L5SwaggerServiceProvider;
use NunoMaduro\PhpInsights\Application\Adapters\Laravel\InsightsServiceProvider;

return [
    AppServiceProvider::class,
    L5SwaggerServiceProvider::class,
    IdeHelperServiceProvider::class,
    AiServiceProvider::class,
    MailServiceProvider::class,
    InsightsServiceProvider::class,
];
