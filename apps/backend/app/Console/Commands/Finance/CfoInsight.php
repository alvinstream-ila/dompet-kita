<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\GetQuantumInsightsAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class CfoInsight extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'cfo:insight {user_id? : Optional user ID to analyze}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Quantum Insight Engine: Analyze transaction patterns and generate financial optimizations';

    /**
     * Execute the console command.
     */
    public function handle(GetQuantumInsightsAction $action): int
    {
        try {
            $userId = $this->argument('user_id');

            if ($userId) {
                $user = User::find($userId);
                if (! $user) {
                    $this->error("User with ID {$userId} not found.");

                    return 1;
                }
                $this->processInsight($user, $action);
            } else {
                $this->info('Starting global financial analysis for all active users...');
                User::all()->each(fn (User $user) => $this->processInsight($user, $action));
            }

            $this->info('Financial analysis completed successfully.');

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }

    private function processInsight(User $user, GetQuantumInsightsAction $action): void
    {
        $this->comment("Analyzing patterns for {$user->name}...");
        $action->execute($user);
        $this->info("✓ Insights generated for {$user->name}.");
    }
}
