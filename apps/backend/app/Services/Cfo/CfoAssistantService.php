<?php

namespace App\Services\Cfo;

use App\Enums\TransactionType;
use App\Models\ScheduledTransaction;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CfoAssistantService
{
    /**
     * Process all scheduled transactions that are due.
     */
    public function processScheduledTransactions(): int
    {
        $processedCount = 0;
        $dueTransactions = ScheduledTransaction::active()->due()->get();

        foreach ($dueTransactions as $scheduled) {
            DB::transaction(function () use ($scheduled, &$processedCount) {
                // If auto-execute is enabled, create the actual transaction
                if ($scheduled->is_auto_execute) {
                    $this->executeTransaction($scheduled);
                } else {
                    // Placeholder: In production, we would send a notification here
                    Log::info("CFO Sentinel: Scheduled transaction '{$scheduled->description}' is due but needs manual approval.");
                }

                // Update the scheduled record for the next cycle
                $this->updateNextDueDate($scheduled);
                $processedCount++;
            });
        }

        return $processedCount;
    }

    /**
     * Create a real transaction from a scheduled one.
     */
    protected function executeTransaction(ScheduledTransaction $scheduled): void
    {
        Transaction::create([
            'user_id' => $scheduled->user_id,
            'amount' => $scheduled->amount,
            'type' => TransactionType::from($scheduled->type),
            'category' => $scheduled->category,
            'description' => "CFO Auto: {$scheduled->description}",
            'date' => now(), // Execute on current date
        ]);

        $scheduled->last_executed_at = now();
        $scheduled->save();

        Log::info("CFO Auto-Execute: Successfully processed '{$scheduled->description}' for user ID {$scheduled->user_id}.");
    }

    /**
     * Advance the next_due_date based on recurrence rule.
     */
    protected function updateNextDueDate(ScheduledTransaction $scheduled): void
    {
        $nextDate = Carbon::parse($scheduled->next_due_date);

        switch ($scheduled->recurrence) {
            case 'daily':
                $nextDate->addDay();
                break;
            case 'weekly':
                $nextDate->addWeek();
                break;
            case 'monthly':
                $nextDate->addMonth();
                break;
            case 'yearly':
                $nextDate->addYear();
                break;
            default:
                $scheduled->status = 'finished'; // If no valid recurrence, finish it
                break;
        }

        $scheduled->next_due_date = $nextDate;
        $scheduled->save();
    }
}
