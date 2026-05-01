<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\PerformCfoAnalysisAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class CfoAnalyze extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cfo:analyze {--month= : Month for analysis (YYYY-MM)} {--user= : User ID to analyze}';

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

            $userId = $this->option('user');
            if (! $userId) {
                $this->error('User ID required via --user flag.');

                return 1;
            }

            /** @var User|null $user */
            $user = \App\Models\User::find($userId);
            if (! $user) {
                $this->error("User with ID {$userId} not found.");

                return 1;
            }

            $this->comment("Analyzing data for: {$month} (User: {$user->name})");

            $this->warn('Consulting with Gemini AI...');
            $result = $action->execute($user, $month);

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
