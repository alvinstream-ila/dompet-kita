<?php

namespace Tests\Feature;

use App\Enums\LoanStatus;
use App\Enums\LoanType;
use App\Models\Loan;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JournalSynchronizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_loan_journal_synchronizes_on_update(): void
    {
        /** @var User $user */
        $user = User::factory()->create();
        $this->actingAs($user);

        // 1. Create a loan
        $loan = Loan::create([
            'user_id' => $user->id,
            'contact_name' => 'John Doe',
            'type' => LoanType::DEBT,
            'amount' => 1000,
            'remaining_amount' => 1000,
            'status' => LoanStatus::ACTIVE,
            'description' => 'Test loan',
        ]);

        // Expect exactly 1 journal entry (loan_creation)
        $journals = Transaction::where('user_id', $user->id)
            ->where('metadata->source_type', Loan::class)
            ->where('metadata->source_id', $loan->id)
            ->get();

        $this->assertCount(1, $journals);
        /** @var Transaction $journal */
        $journal = $journals->first();
        $this->assertEquals(1000, $journal->amount);
        $this->assertIsArray($journal->metadata);
        $this->assertEquals('loan_creation', $journal->metadata['journal_context']);

        // 2. Update loan amount
        $loan->update(['amount' => 1500]);

        $journals = Transaction::where('user_id', $user->id)
            ->where('metadata->source_type', Loan::class)
            ->where('metadata->source_id', $loan->id)
            ->get();

        // Still 1 entry, but amount updated
        $this->assertCount(1, $journals);
        /** @var Transaction $journal */
        $journal = $journals->first();
        $this->assertEquals(1500, $journal->amount);

        // 3. Mark as paid
        $loan->update(['status' => LoanStatus::PAID]);

        $journals = Transaction::where('user_id', $user->id)
            ->where('metadata->source_type', Loan::class)
            ->where('metadata->source_id', $loan->id)
            ->get();

        // Now we expect 2 entries (creation and settlement)
        $this->assertCount(2, $journals);
        $this->assertContains('loan_creation', $journals->pluck('metadata.journal_context')->toArray());
        $this->assertContains('loan_settlement', $journals->pluck('metadata.journal_context')->toArray());

        // 4. Revert to active
        $loan->update(['status' => LoanStatus::ACTIVE]);

        $journals = Transaction::where('user_id', $user->id)
            ->where('metadata->source_type', Loan::class)
            ->where('metadata->source_id', $loan->id)
            ->get();

        // Back to 1 entry (settlement removed)
        $this->assertCount(1, $journals);
        /** @var Transaction $journal */
        $journal = $journals->first();
        $this->assertIsArray($journal->metadata);
        $this->assertEquals('loan_creation', $journal->metadata['journal_context']);
    }
}
