<?php

use Gemini;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$key = env('GEMINI_API_KEY');
try {
    $client = Gemini::client($key);
    $models = $client->models()->list();
    foreach ($models->models as $model) {
        if (strpos($model->name, 'gemini') !== false) {
            echo $model->name."\n";
        }
    }
} catch (Exception $e) {
    echo 'ERROR: '.$e->getMessage()."\n";
}
