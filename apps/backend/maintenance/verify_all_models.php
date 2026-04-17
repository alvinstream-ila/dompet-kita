<?php

use App\Models\Asset;
use App\Models\Budget;
use App\Models\ChatHistory;
use App\Models\FinancialWisdom;
use App\Models\Goal;
use App\Models\Holiday;
use App\Models\Loan;
use App\Models\LoginHistory;
use App\Models\ScheduledTransaction;
use App\Models\Transaction;
use App\Models\TransactionInsight;
use App\Models\User;
use App\Models\WealthHistory;
use Illuminate\Contracts\Console\Kernel;
use Spatie\Activitylog\Models\Activity as ActivityLog;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$models = [
    'ActivityLog' => ActivityLog::class,
    'Asset' => Asset::class,
    'Budget' => Budget::class,
    'ChatHistory' => ChatHistory::class,
    'FinancialWisdom' => FinancialWisdom::class,
    'Goal' => Goal::class,
    'Holiday' => Holiday::class,
    'Loan' => Loan::class,
    'LoginHistory' => LoginHistory::class,
    'ScheduledTransaction' => ScheduledTransaction::class,
    'Transaction' => Transaction::class,
    'TransactionInsight' => TransactionInsight::class,
    'User' => User::class,
    'WealthHistory' => WealthHistory::class,
];

foreach ($models as $name => $class) {
    try {
        echo "Accessing {$name} model... ";
        $record = $class::first();
        echo 'SUCCESS (Found: '.($record ? 'Y' : 'N').")\n";
    } catch (Throwable $e) {
        echo 'FAILED: '.$e->getMessage()."\n";
    }
}
