<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\AssetController;
use App\Http\Controllers\HolidayController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Transactions
Route::get('/transactions/summary', [TransactionController::class, 'summary']);
Route::apiResource('transactions', TransactionController::class);

// Loans (Ila's Business & Personal)
Route::apiResource('loans', LoanController::class);

// Assets (Wealth Tracking)
Route::apiResource('assets', AssetController::class);

// Holidays (Planning)
Route::apiResource('holidays', HolidayController::class);

// Health Check
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'backend' => 'Laravel 11', 'php' => PHP_VERSION]);
});
