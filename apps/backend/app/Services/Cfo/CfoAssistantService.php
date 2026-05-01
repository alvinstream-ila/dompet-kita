<?php

namespace App\Services\Cfo;

use App\Enums\RecurrenceFrequency;
use App\Enums\ScheduleStatus;
use App\Models\ScheduledTransaction;
use App\Models\Transaction;
use Illuminate\Support\Carbon;
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
        $dueTransactions = ScheduledTransaction::withoutGlobalScopes()->active()->due()->get();

        /** @var ScheduledTransaction $scheduled */
        foreach ($dueTransactions as $scheduled) {
            // Robust Catch-up Protocol:
            // If the system was offline for multiple cycles, we must catch up ALL missed transactions.
            while (Carbon::parse($scheduled->next_due_date)->isPast()) {
                DB::transaction(function () use ($scheduled, &$processedCount): void {
                    // If auto-execute is enabled, create the actual transaction
                    if ($scheduled->is_auto_execute) {
                        $this->executeTransaction($scheduled);
                    } else {
                        Log::info("CFO Sentinel: Scheduled transaction '{$scheduled->description}' is due but needs manual approval.");
                    }

                    // Update the scheduled record for the next cycle
                    $this->updateNextDueDate($scheduled);
                    $processedCount++;
                });

                // Refresh the model to get the updated next_due_date for the while loop condition
                $scheduled->refresh();
                
                // Safety break to prevent infinite loops if updateNextDueDate fails to advance the date
                if ($scheduled->status === ScheduleStatus::FINISHED) {
                    break;
                }
            }
        }

        return $processedCount;
    }

    /**
     * Create a real transaction from a scheduled one.
     */
    public function executeTransaction(ScheduledTransaction $scheduled): void
    {
        Transaction::create([
            'user_id' => $scheduled->user_id,
            'household_id' => $scheduled->household_id,
            'asset_id' => $scheduled->asset_id,
            'amount' => $scheduled->amount,
            'type' => $scheduled->type,
            'category' => $scheduled->category,
            'description' => "CFO Auto: {$scheduled->description}",
            // Use next_due_date as the transaction date for historical accuracy.
            // This ensures catch-up transactions appear on the correct date in reports,
            // not all grouped on the day the catch-up was processed.
            'date' => Carbon::parse($scheduled->next_due_date)->toDateString(),
        ]);

        $scheduled->last_executed_at = now();
        $scheduled->save();

        Log::info("CFO Auto-Execute: Successfully processed '{$scheduled->description}' for user ID {$scheduled->user_id}.");
    }

    /**
     * Manually execute a transaction and advance the date.
     */
    public function executeTransactionManually(ScheduledTransaction $scheduled): void
    {
        DB::transaction(function () use ($scheduled): void {
            $this->executeTransaction($scheduled);
            $this->updateNextDueDate($scheduled);
        });
    }

    /**
     * Advance the next_due_date based on recurrence rule.
     */
    protected function updateNextDueDate(ScheduledTransaction $scheduled): void
    {
        $nextDate = Carbon::parse($scheduled->next_due_date);

        switch ($scheduled->recurrence) {
            case RecurrenceFrequency::DAILY:
                $nextDate->addDay();
                break;
            case RecurrenceFrequency::WEEKLY:
                $nextDate->addWeek();
                break;
            case RecurrenceFrequency::MONTHLY:
                $nextDate->addMonth();
                break;
            case RecurrenceFrequency::YEARLY:
                $nextDate->addYear();
                break;
            default:
                $scheduled->status = ScheduleStatus::FINISHED; // If no valid recurrence, finish it
                break;
        }

        $scheduled->next_due_date = $nextDate;
        $scheduled->save();
    }
}
