<?php

namespace App\Console\Commands;

use App\Models\Holiday;
use Illuminate\Console\Command;

class HolidayPlan extends Command
{
    protected $signature = 'app:holiday-plan {action=list} {--dest=} {--budget=} {--id=}';
    protected $description = 'Plan and monitor share travel and vacations';

    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'create': $this->createPlan(); break;
            case 'list': $this->listPlans(); break;
            default: $this->error("Invalid action: $action");
        }
    }

    private function createPlan()
    {
        $dest = $this->option('dest');
        $budget = (float) $this->option('budget');

        if (!$dest || !$budget) {
            $this->error("Destination and budget required.");
            return;
        }

        Holiday::create(['destination' => $dest, 'budget' => $budget, 'spent' => 0, 'status' => 'planning']);
        $this->info("Holiday plan for '$dest' created!");
    }

    private function listPlans()
    {
        $plans = Holiday::all();
        if ($plans->isEmpty()) { $this->info("No holiday plans."); return; }

        $this->info("### 🏝️ Travel & Vacation Plans");
        foreach ($plans as $plan) {
            $this->line("- {$plan->destination}: Rp " . number_format($plan->spent, 0) . " / Rp " . number_format($plan->budget, 0) . " ({$plan->status})");
        }
    }
}
