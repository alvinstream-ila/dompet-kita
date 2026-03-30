<?php

namespace App\Console\Commands;

use App\Models\Loan;
use Illuminate\Console\Command;

class LoanManage extends Command
{
    protected $signature = 'app:loan-manage {action} {--debtor=} {--amount=} {--id=}';
    protected $description = 'Manage loans for business tracking';

    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'record':
                $this->recordLoan();
                break;
            case 'list':
                $this->listLoans();
                break;
            case 'mark_paid':
                $this->markPaid();
                break;
            default:
                $this->error("Invalid action: $action");
        }
    }

    private function recordLoan()
    {
        $debtor = $this->option('debtor');
        $amount = (float) $this->option('amount');

        if (!$debtor || !$amount) {
            $this->error("Debtor and amount required.");
            return;
        }

        Loan::create([
            'debtor' => $debtor,
            'amount' => $amount,
            'status' => 'pending'
        ]);

        $this->info("Loan recorded for $debtor: Rp " . number_format($amount, 0, ',', '.'));
    }

    private function listLoans()
    {
        $loans = Loan::orderBy('created_at', 'desc')->get();
        if ($loans->isEmpty()) {
            $this->info("No loans found.");
            return;
        }

        $this->info("### 🏦 Active Loans");
        foreach ($loans as $loan) {
            $this->line("- [{$loan->id}] {$loan->debtor}: Rp " . number_format($loan->amount, 0, ',', '.') . " ({$loan->status})");
        }
    }

    private function markPaid()
    {
        $id = $this->option('id');
        if (!$id) {
            $this->error("Loan ID required.");
            return;
        }

        $loan = Loan::find($id);
        if (!$loan) {
            $this->error("Loan not found.");
            return;
        }

        $loan->update(['status' => 'paid']);
        $this->info("Loan $id marked as paid.");
    }
}
