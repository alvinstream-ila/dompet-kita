<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\GetSavingsGoalsSummaryAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class GoalCheck extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:goal-check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Monitor progress on financial savings goals';

    /**
     * Execute the console command.
     */
    public function handle(GetSavingsGoalsSummaryAction $action): int
    {
        try {
            $defaultUser = User::find(1);
            $result = $action->execute($defaultUser);
            $goals = $result['goals'];

            if ($goals->isEmpty()) {
                $this->info('No goals defined yet.');

                return 0;
            }

            $this->info('### 🎯 Financial Goals Progress');
            foreach ($goals as $goal) {
                $percentage = $goal->target_amount > 0 ? ($goal->current_amount / $goal->target_amount) * 100 : 0;
                $bar = $this->renderProgressBar($percentage);

                $this->line("\n**{$goal->name}**");
                $this->line("{$bar} ".number_format($percentage, 1).'%');
                $this->line('Status: Rp '.number_format($goal->current_amount, 0, ',', '.').' / Rp '.number_format($goal->target_amount, 0, ',', '.'));

                if ($goal->deadline) {
                    $this->line('Deadline: '.$goal->deadline->format('d M Y'));
                }
            }

            $this->newLine();
            $this->info('Overall Progress: '.number_format($result['overall_progress'], 1).'%');

            return 0;
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }

    private function renderProgressBar(float $percent): string
    {
        $length = 20;
        $filled = (int) floor($percent / (100 / $length));
        $filled = max(0, min($length, $filled));

        return '['.str_repeat('█', $filled).str_repeat('░', $length - $filled).']';
    }
}
