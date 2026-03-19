<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => '💰 Dompet Kita (Evolution Edition)',
        'owner' => 'Alvin & Ila',
        'status' => 'Backend Active & Running 🐘',
        'health_check' => url('/up')
    ]);
});

Route::get('/clear-cache', function() {
    \Illuminate\Support\Facades\Artisan::call('route:clear');
    \Illuminate\Support\Facades\Artisan::call('config:clear');
    \Illuminate\Support\Facades\Artisan::call('cache:clear');
    return "Hore! Cache sudah bersih sayang! ✨";
});
