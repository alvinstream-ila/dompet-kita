<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\ManageHolidayPlanAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class HolidayPlan extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:holiday-plan {action=list} {--dest=} {--budget=} {--id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Plan and monitor share travel and vacations';

    /**
     * Execute the console command.
     */
    public function handle(ManageHolidayPlanAction $action): int
    {
        try {
            $subAction = $this->argument('action');
            $defaultUser = User::find(1);

            if (! $defaultUser) {
                $this->error('Primary user (ID 1) not found.');

                return 1;
            }

            return match ($subAction) {
                'create' => $this->handleCreate($action, $defaultUser),
                'list' => $this->handleList($action, $defaultUser),
                default => $this->handleInvalidAction((string) $subAction),
            };
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }

    private function handleCreate(ManageHolidayPlanAction $action, User $user): int
    {
        $dest = $this->option('dest');
        $budget = $this->option('budget');

        if (! $dest || $budget === null) {
            $this->error('Destination and budget required.');

            return 1;
        }

        $action->create($user, [
            'destination' => $dest,
            'budget' => (float) $budget,
        ]);

        $this->info("✅ Holiday plan for '{$dest}' created!");

        return 0;
    }

    private function handleList(ManageHolidayPlanAction $action, User $user): int
    {
        $plans = $action->list($user);

        if ($plans->isEmpty()) {
            $this->info('No holiday plans.');

            return 0;
        }

        $this->info('### 🏝️ Travel & Vacation Plans');
        foreach ($plans as $plan) {
            $this->line("- {$plan->destination}: Rp ".number_format((float) $plan->spent, 0).' / Rp '.number_format((float) $plan->budget, 0)." ({$plan->status})");
        }

        return 0;
    }

    private function handleInvalidAction(string $action): int
    {
        $this->error("Invalid action: {$action}");

        return 1;
    }
}
