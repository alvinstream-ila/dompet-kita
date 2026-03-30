<?php

namespace App\Console\Commands;

use App\Models\Goal;
use Illuminate\Console\Command;

class GoalCheck extends Command
{
    protected $signature = 'app:goal-check';
    protected $description = 'Monitor progress on financial savings goals';

    public function handle()
    {
        $goals = Goal::all();
        if ($goals->isEmpty()) {
            $this->info("No goals defined yet.");
            return;
        }

        $this->info("### 🎯 Financial Goals Progress");
        foreach ($goals as $goal) {
            $percentage = ($goal->current_amount / $goal->target_amount) * 100;
            $bar = $this->renderProgressBar($percentage);
            
            $this->line("\n**{$goal->name}**");
            $this->line("$bar " . number_format($percentage, 1) . "%");
            $this->line("Status: Rp " . number_format($goal->current_amount, 0, ',', '.') . " / Rp " . number_format($goal->target_amount, 0, ',', '.'));
            if ($goal->deadline) {
                $this->line("Deadline: " . $goal->deadline->format('d M Y'));
            }
        }
    }

    private function renderProgressBar($percent)
    {
        $length = 20;
        $filled = floor($percent / (100 / $length));
        $filled = max(0, min($length, $filled));
        return "[" . str_repeat("█", $filled) . str_repeat("░", $length - $filled) . "]";
    }
}
