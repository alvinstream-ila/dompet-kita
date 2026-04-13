<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\PerformCfoAnalysisAction;
use Exception;
use Illuminate\Console\Command;

class CfoAnalyze extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cfo:analyze {--month= : Month for analysis (YYYY-MM)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'AI CFO: Analyze monthly transactions and provide strategic financial insights';

    /**
     * Execute the console command.
     */
    public function handle(PerformCfoAnalysisAction $action): int
    {
        try {
            $this->info('💰 DOMPET KITA - CHIEF FINANCIAL OFFICER (AI)');
            $this->info('===========================================');

            $monthOption = $this->option('month');
            $month = is_string($monthOption) ? $monthOption : now()->format('Y-m');
            $this->comment("Analyzing data for: {$month}");

            $this->warn('Consulting with Gemini AI...');
            $result = $action->execute($month);

            $this->info('✨ STRATEGIC INSIGHTS:');
            $this->line($result['advice']);

            $this->info('===========================================');

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }
}
