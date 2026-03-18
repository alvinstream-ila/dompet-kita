<?php

use App\Http\Controllers\AssetController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\HolidayController;
use App\Http\Controllers\LoanController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WealthHistoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['status' => 'ok', 'service' => 'Dompet Kita API']);
});

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [\App\Http\Controllers\PasswordResetController::class, 'sendResetLinkEmail']);
Route::post('/reset-password', [\App\Http\Controllers\PasswordResetController::class, 'reset'])->name('password.reset');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::put('/user/profile', [UserController::class, 'update']);
    Route::put('/user/change-password', [UserController::class, 'changePassword']);

    // Transactions
    Route::get('/transactions/summary', [TransactionController::class, 'summary']);
    Route::apiResource('transactions', TransactionController::class);

    // Assets
    Route::get('/wealth-history', [WealthHistoryController::class, 'index']);
    Route::apiResource('assets', AssetController::class);

    // Loans
    Route::apiResource('loans', LoanController::class);

    // Goals
    Route::apiResource('goals', GoalController::class);

    // AI & Services (The Gatekeeper)
    Route::post('/ai/analyze', [\App\Http\Controllers\AIController::class, 'analyzeReceipt']);
    Route::post('/media/upload', [\App\Http\Controllers\MediaController::class, 'upload']);

    // Holidays
    Route::apiResource('holidays', HolidayController::class);
});
