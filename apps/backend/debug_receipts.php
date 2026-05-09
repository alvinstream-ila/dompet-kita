<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$transactions = \App\Models\Transaction::whereNotNull('receipt_url')->latest()->limit(10)->get();
foreach ($transactions as $t) {
    echo "ID: {$t->id}\n";
    echo "RAW: {$t->receipt_url}\n";
    $resource = new \App\Http\Resources\TransactionResource($t);
    $data = $resource->toArray(request());
    echo "TRANSFORMED: {$data['receipt_url']}\n";
    echo "-------------------\n";
}
