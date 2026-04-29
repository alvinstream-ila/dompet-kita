<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use App\Models\User;
use App\Http\Controllers\TransactionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = User::first();
Auth::login($user);

$request = Request::create('/api/transactions', 'GET', [
    'month' => now()->month,
    'year' => now()->year,
]);
$request->setUserResolver(fn() => $user);

$controller = $app->make(TransactionController::class);
$response = $controller->index($request);

echo $response->getContent();
