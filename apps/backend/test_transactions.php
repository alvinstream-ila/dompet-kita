<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use App\Models\User;
use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = User::first();
if (!$user) {
    echo "No user found\n";
    exit;
}

echo "User: {$user->name} (ID: {$user->id})\n";
echo "Household: {$user->household_id}\n";

Auth::login($user);

$total = Transaction::withoutGlobalScopes()->count();
echo "Total Transactions (no scope): {$total}\n";

$scoped = Transaction::count();
echo "Scoped Transactions: {$scoped}\n";

$thisMonth = Transaction::filterByPeriod(now()->month, now()->year)->get();
echo "Transactions for this month: " . $thisMonth->count() . "\n";

foreach ($thisMonth as $t) {
    echo "- [{$t->date->toDateString()}] {$t->description}: {$t->amount} ({$t->household_id})\n";
}
