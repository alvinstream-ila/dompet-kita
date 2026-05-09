<?php

namespace App\Console\Commands;

use App\Models\Transaction;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FixReceiptUrls extends Command
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
    protected $description = 'Fix expired signed receipt URLs in the database by stripping them back to relative storage paths.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Scanning transactions for malformed receipt URLs...');

        $transactions = Transaction::whereNotNull('receipt_url')
            ->where('receipt_url', 'like', 'http%')
            ->get();

        if ($transactions->isEmpty()) {
            $this->info('No transactions found with full URLs in receipt_url.');
            return 0;
        }

        $this->info("Found {$transactions->count()} transactions to fix.");

        $fixedCount = 0;
        foreach ($transactions as $transaction) {
            $url = $transaction->receipt_url;
            
            // Try to extract the path from common patterns
            // Example URL: https://xxx.r2.cloudflarestorage.com/dompet-kita/receipts/household_id/filename.jpg?X-Amz-...
            // We want: receipts/household_id/filename.jpg
            
            $path = null;
            
            // Pattern for Cloudflare R2 / S3
            if (preg_match('/receipts\/[^\?]+/', $url, $matches)) {
                $path = $matches[0];
            } 
            // Fallback for custom media serve route if stored by mistake
            elseif (preg_match('/media\/serve\?path=([^&]+)/', $url, $matches)) {
                $path = urldecode($matches[1]);
            }

            if ($path) {
                $this->line("Fixing [{$transaction->id}]: {$url} -> {$path}");
                
                if (!$this->option('dry-run')) {
                    $transaction->update(['receipt_url' => $path]);
                }
                $fixedCount++;
            } else {
                $this->warn("Could not extract path from [{$transaction->id}]: {$url}");
            }
        }

        $dryRunSuffix = $this->option('dry-run') ? ' (DRY RUN)' : '';
        $this->info("Finished fixing {$fixedCount} URLs{$dryRunSuffix}.");

        return 0;
    }
}
