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
    protected $signature = 'cfo:insight {user_id : User ID to analyze}';

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
        $status = 0;

        try {
            $userId = $this->argument('user_id');
            $user = $userId ? User::find($userId) : null;

            if (! $user) {
                $this->error($userId ? "User with ID {$userId} not found." : 'User ID is required.');
                $status = 1;
            } else {
                $this->processInsight($user, $action);
                $this->info('Financial analysis completed successfully.');
            }
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");
            $status = 1;
        }

        return $status;
    }

    private function processInsight(User $user, GetQuantumInsightsAction $action): void
    {
        $this->comment("Analyzing patterns for {$user->name}...");
        $action->execute($user);
        $this->info("✓ Insights generated for {$user->name}.");
    }
}
