<?php

namespace App\Console\Commands\System;

use App\Models\Transaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FixExpiredReceiptUrls extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'system:fix-receipt-urls {--dry-run : Only show what would be changed}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Convert full temporary receipt URLs in the database back to storage paths';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🛡️ Starting Receipt URL Recovery Protocol...');

        $transactions = Transaction::where('receipt_url', 'like', 'http%')->get();

        if ($transactions->isEmpty()) {
            $this->info('✅ No malformed URLs found. System integrity is optimal.');
            return 0;
        }

        $this->warn("Found {$transactions->count()} transactions with full URLs.");

        $count = 0;
        foreach ($transactions as $transaction) {
            $oldUrl = $transaction->receipt_url;
            
            // Extract path from URL
            // Pattern: https://.../bucket-name/receipts/...
            // We want to keep from 'receipts/' onwards
            $path = '';
            if (preg_match('/receipts\/[^\?]+/', $oldUrl, $matches)) {
                $path = $matches[0];
            }

            if ($path) {
                $this->line("Fixing [ID: {$transaction->id}]: {$path}");
                
                if (!$this->option('dry-run')) {
                    $transaction->update(['receipt_url' => $path]);
                }
                $count++;
            } else {
                $this->error("Could not extract path from: {$oldUrl}");
            }
        }

        $status = $this->option('dry-run') ? 'would be fixed' : 'fixed';
        $this->info("✅ {$count} URLs {$status}.");

        return 0;
    }
}
