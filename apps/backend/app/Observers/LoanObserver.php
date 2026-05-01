<?php

namespace App\Observers;

use App\Enums\LoanStatus;
use App\Enums\LoanType;
use App\Enums\TransactionType;
use App\Models\Loan;
use App\Traits\ClearsFinancialCache;

class LoanObserver
{
    use ClearsFinancialCache;

    /**
     * Handle the Loan "created" event.
     */
    public function created(Loan $loan): void
    {
        // When a loan is created:
        // Utang (Debt/Money In) = INCOME
        // Piutang (Credit/Money Out) = EXPENSE
        $type = $loan->type === LoanType::DEBT ? TransactionType::INCOME : TransactionType::EXPENSE;
        $label = $loan->type === LoanType::DEBT ? 'Utang' : 'Piutang';

        $loan->syncJournal(
            'loan_creation',
            (float) $loan->amount,
            $type,
            'Pinjaman',
            "Pencatatan {$label} baru dari/ke: {$loan->contact_name}",
            $loan->created_at
        );

        $this->invalidateFinancialCache($loan->user_id);
    }

    /**
     * Handle the Loan "updated" event.
     */
    public function updated(Loan $loan): void
    {
        // Only re-sync the creation journal if core financial data changed.
        // This guards against redundant I/O on minor updates (e.g. changing due_date).
        if ($loan->wasChanged(['amount', 'type', 'contact_name'])) {
            $createType = $loan->type === LoanType::DEBT ? TransactionType::INCOME : TransactionType::EXPENSE;
            $createLabel = $loan->type === LoanType::DEBT ? 'Utang' : 'Piutang';

            $loan->syncJournal(
                'loan_creation',
                (float) $loan->amount,
                $createType,
                'Pinjaman',
                "Pencatatan {$createLabel} baru dari/ke: {$loan->contact_name}",
                $loan->created_at
            );
        }

        // Check if the loan is paid
        if ($loan->status === LoanStatus::PAID) {
            // When a loan is paid:
            // Settling Utang (Paying back) = Money Out = EXPENSE
            // Settling Piutang (Receiving money) = Money In = INCOME
            $type = $loan->type === LoanType::DEBT ? TransactionType::EXPENSE : TransactionType::INCOME;
            $label = $loan->type === LoanType::DEBT ? 'Pelunasan Utang' : 'Penerimaan Piutang';

            $loan->syncJournal(
                'loan_settlement',
                (float) $loan->amount, // Use the full amount for settlement journal
                $type,
                'Pinjaman',
                "{$label} dari/ke: {$loan->contact_name}"
            );
        } else {
            $loan->removeJournal('loan_settlement');
        }

        $this->invalidateFinancialCache($loan->user_id);
    }

    /**
     * Handle the Loan "deleted" event.
     */
    public function deleted(Loan $loan): void
    {
        // Remove all journal entries linked to this loan to prevent phantom records
        // from appearing in the user's financial dashboard after deletion.
        $loan->removeJournal('loan_creation');
        $loan->removeJournal('loan_settlement');

        $this->invalidateFinancialCache($loan->user_id);
    }
}
