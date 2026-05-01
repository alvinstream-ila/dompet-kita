<?php

namespace Tests\Feature\Finance;

use App\Enums\RecurrenceFrequency;
use App\Enums\ScheduleStatus;
use App\Enums\TransactionType;
use App\Models\Household;
use App\Models\ScheduledTransaction;
use App\Models\Transaction;
use App\Models\User;
use App\Services\Cfo\CfoAssistantService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ScheduledTransactionCatchupTest extends TestCase
{
    use RefreshDatabase;

    public function test_scheduled_transaction_processes_multiple_missed_occurrences(): void
    {
        $user = User::factory()->create();
        $household = Household::factory()->create(['owner_id' => $user->id]);
        $user->update(['household_id' => $household->id]);
        $this->actingAs($user);

        // A daily transaction that was due 3 days ago
        $scheduled = ScheduledTransaction::create([
            'user_id' => $user->id,
            'household_id' => $household->id,
            'description' => 'Daily Water Bill',
            'amount' => 10,
            'type' => TransactionType::EXPENSE,
            'category' => 'Utilities',
            'recurrence' => RecurrenceFrequency::DAILY,
            'next_due_date' => now()->subDays(2)->toDateString(), // Due 2 days ago, yesterday, and today
            'status' => ScheduleStatus::ACTIVE,
            'is_auto_execute' => true,
        ]);

        $service = app(CfoAssistantService::class);
        try {
            $service->processScheduledTransactions();
        } catch (\Exception $e) {
            $this->fail('Failed with error: '.$e->getMessage()."\n".$e->getTraceAsString());
        }

        // Currently it only processes ONCE per run.
        // We want it to process 3 times (for -2, -1, and today).
        $this->assertEquals(3, Transaction::count(), 'Should have created 3 transactions for missed days');
        $refreshed = $scheduled->fresh();
        $this->assertNotNull($refreshed);
        $this->assertTrue($refreshed->next_due_date->isFuture(), 'Next due date should be in the future');
    }
}
