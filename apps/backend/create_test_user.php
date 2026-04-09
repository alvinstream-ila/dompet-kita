<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$email = 'tester-alvin@dompetkita.id';
$user = User::firstOrNew(['email' => $email]);
$user->name = 'Tester Alvin';
$user->password = Hash::make('password123');
$user->email_verified_at = now();
$user->two_factor_enabled = false;
$user->save();

echo "User $email is ready for E2E testing.\n";
