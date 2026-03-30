<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => '💰 Dompet Kita (Evolution Edition)',
        'owner' => 'Alvin & Ila',
        'status' => 'Backend Active & Running 🐘',
        'health_check' => url('/up'),
    ]);
});
