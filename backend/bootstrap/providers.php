<?php

use App\Providers\AppServiceProvider;
use L5Swagger\L5SwaggerServiceProvider;

return [
    AppServiceProvider::class,
    L5SwaggerServiceProvider::class,
    Barryvdh\LaravelIdeHelper\IdeHelperServiceProvider::class,
    NunoMaduro\PhpInsights\Laravel\PhpInsightsServiceProvider::class,
];
