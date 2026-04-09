<?php

namespace App\Services\Cfo;

use App\Enums\RecurrenceFrequency;
use App\Enums\ScheduleStatus;
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

        /** @var \App\Models\ScheduledTransaction $scheduled */
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
    public function executeTransaction(ScheduledTransaction $scheduled): void
    {
        Transaction::create([
            'user_id' => $scheduled->user_id,
            'amount' => $scheduled->amount,
            'type' => $scheduled->type,
            'category' => $scheduled->category,
            'description' => "CFO Auto: {$scheduled->description}",
            'date' => now(), // Execute on current date
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
        DB::transaction(function () use ($scheduled) {
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
