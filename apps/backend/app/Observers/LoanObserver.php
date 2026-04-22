<?php

namespace App\Observers;

use App\Enums\LoanStatus;
use App\Enums\LoanType;
use App\Enums\TransactionType;
use App\Traits\ClearsFinancialCache;
use App\Models\Loan;

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

        $loan->recordJournal(
            (float) $loan->amount,
            $type,
            'Pinjaman',
            "Pencatatan {$label} baru dari/ke: {$loan->contact_name}"
        );

        $this->invalidateFinancialCache($loan->user_id);
    }

    /**
     * Handle the Loan "updated" event.
     */
    public function updated(Loan $loan): void
    {
        // Check if the loan was just marked as paid
        if ($loan->isDirty('status') && $loan->status === LoanStatus::PAID) {
            // When a loan is paid:
            // Settling Utang (Paying back) = Money Out = EXPENSE
            // Settling Piutang (Receiving money) = Money In = INCOME
            $type = $loan->type === LoanType::DEBT ? TransactionType::EXPENSE : TransactionType::INCOME;
            $label = $loan->type === LoanType::DEBT ? 'Pelunasan Utang' : 'Penerimaan Piutang';

            $loan->recordJournal(
                (float) $loan->amount, // Use the full amount for settlement journal
                $type,
                'Pinjaman',
                "{$label} dari/ke: {$loan->contact_name}"
            );
        }

        $this->invalidateFinancialCache($loan->user_id);
    }

    /**
     * Handle the Loan "deleted" event.
     */
    public function deleted(Loan $loan): void
    {
        $this->invalidateFinancialCache($loan->user_id);
    }
}
