<?php

/**
 * Manual test script for Loans alignment.
 */

require_once __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

use App\Http\Resources\LoanResource;
use App\Models\Loan;
use App\Models\User;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Auth;

$app->make(Kernel::class)->bootstrap();

$user = User::first();
if (! $user) {
    echo "No user found.\n";
    exit;
}

Auth::login($user);

$loan = Loan::where('user_id', $user->id)->first();
if (! $loan) {
    echo "No loan found for user {$user->id}.\n";
    exit;
}

$resource = new LoanResource($loan);
$data = $resource->resolve();

echo "Aligned Resource Data:\n";
print_r($data);

if (isset($data['contact_name']) && isset($data['description'])) {
    echo "SUCCESS: contact_name and description are present.\n";
} else {
    echo "FAILURE: Missing fields.\n";
}
