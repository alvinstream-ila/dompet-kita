<?php

declare(strict_types=1);

namespace App\Console\Commands\Finance;

use App\Actions\Finance\ManageLoanAction;
use App\Models\User;
use Exception;
use Illuminate\Console\Command;

class LoanManage extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:loan-manage {action} {--debtor=} {--amount=} {--id=}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage loans for business tracking';

    /**
     * Execute the console command.
     */
    public function handle(ManageLoanAction $action): int
    {
        try {
            $subAction = $this->argument('action');
            $defaultUser = User::find(1);

            if (! $defaultUser) {
                $this->error('Primary user (ID 1) not found.');

                return 1;
            }

            return match ($subAction) {
                'record' => $this->handleRecord($action, $defaultUser),
                'list' => $this->handleList($action, $defaultUser),
                'mark_paid' => $this->handleMarkPaid($action),
                default => $this->handleInvalidAction((string) $subAction),
            };
        } catch (Exception $e) {
            $this->error("Fatal Error: {$e->getMessage()}");

            return 1;
        }
    }

    private function handleRecord(ManageLoanAction $action, User $user): int
    {
        $debtor = $this->option('debtor');
        $amount = $this->option('amount');

        if (! $debtor || $amount === null) {
            $this->error('Debtor and amount required.');

            return 1;
        }

        $action->record($user, [
            'type' => 'debt', // Default type for this command
            'contact_name' => $debtor,
            'amount' => (float) $amount,
        ]);

        $this->info("✅ Loan recorded for {$debtor}: Rp ".number_format((float) $amount, 0, ',', '.'));

        return 0;
    }

    private function handleList(ManageLoanAction $action, User $user): int
    {
        $loans = $action->list($user);

        if ($loans->isEmpty()) {
            $this->info('No loans found.');

            return 0;
        }

        $this->info('### 🏦 Active Loans');
        foreach ($loans as $loan) {
            $this->line("- [{$loan->id}] {$loan->contact_name}: Rp ".number_format((float) $loan->amount, 0, ',', '.')." ({$loan->status->value})");
        }

        return 0;
    }

    private function handleMarkPaid(ManageLoanAction $action): int
    {
        $id = $this->option('id');
        if (! $id) {
            $this->error('Loan ID required.');

            return 1;
        }

        $action->markAsPaid((int) $id);
        $this->info("✅ Loan {$id} marked as paid.");

        return 0;
    }

    private function handleInvalidAction(string $action): int
    {
        $this->error("Invalid action: {$action}");

        return 1;
    }
}
