<?php

namespace App\Http\Controllers;

use App\Enums\LoanType;
use App\Enums\TransactionType;
use App\Http\Resources\LoanResource;
use App\Models\Loan;
use App\Models\Transaction;
use App\Models\User;
use App\Traits\HasApiResponses;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Collection;

class LoanController extends Controller
{
    use HasApiResponses;

    /**
     * List all loans for the authenticated user.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $loans = Loan::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return LoanResource::collection($loans);
    }

    /**
     * Store a new loan.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:utang,piutang',
            'amount' => 'required|numeric',
            'remaining_amount' => 'required|numeric',
            'description' => 'required|string',
            'contact_name' => 'required|string',
            'due_date' => 'nullable|date',
            'status' => 'required|in:active,paid',
        ]);

        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $validated['user_id'] = $user->id;

        $loan = Loan::create($validated);

        return $this->success(new LoanResource($loan), 'Catatan utang/piutang baru sudah aku simpan ya! ✍️', 201);
    }

    /**
     * Show a specific loan.
     */
    public function show(Loan $loan): JsonResponse
    {
        $this->authorize('view', $loan);

        return $this->success(new LoanResource($loan), 'Ini detail pinjamannya ya Sayang.');
    }

    /**
     * Update an existing loan.
     */
    public function update(Request $request, Loan $loan): JsonResponse
    {
        $this->authorize('update', $loan);

        $validated = $request->validate([
            'type' => 'sometimes|in:utang,piutang',
            'amount' => 'sometimes|numeric',
            'remaining_amount' => 'sometimes|numeric',
            'description' => 'sometimes|string',
            'contact_name' => 'sometimes|string',
            'due_date' => 'sometimes|nullable|date',
            'status' => 'sometimes|in:active,paid',
        ]);

        $loan->update($validated);

        return $this->success(new LoanResource($loan), 'Data pinjamannya sudah diupdate! ✨');
    }

    /**
     * Generate a loan accountability report for a specific period.
     */
    public function report(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $month = $request->integer('month', now()->month);
        $year = $request->integer('year', now()->year);

        $startDate = Carbon::create($year, $month, 1)?->startOfMonth() ?? now()->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        // 1. Fetch loans active during or before this month
        $loans = Loan::where('user_id', $user->id)
            ->where('created_at', '<=', $endDate)
            ->where(function ($query) use ($startDate) {
                $query->where('status', 'active')
                    ->orWhere('updated_at', '>=', $startDate);
            })
            ->get();

        // 2. Fetch all transactions linked to loans in this month
        $transactions = Transaction::where('user_id', $user->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->whereNotNull('metadata')
            ->get()
            ->filter(function (Transaction $t) {
                $metadata = $t->metadata;

                return is_array($metadata) && ($metadata['source_type'] ?? null) === Loan::class;
            });

        // 3. Calculate Opening Balances (Snapshot at start of month)
        $opening = $this->calculateBalancesAt($loans, $startDate->copy()->subDay());

        // 4. Summarize new activity in this month
        $newActivity = $loans->filter(fn ($l) => $l->created_at->between($startDate, $endDate));

        // 5. Carry-over details (Ending Balance Snapshot)
        $carryOver = $this->calculateBalancesAt($loans, $endDate);

        return $this->success([
            'period' => [
                'month' => $month,
                'year' => $year,
                'label' => $startDate->translatedFormat('F Y'),
            ],
            'summary' => [
                'opening_piutang' => $opening['total_piutang'],
                'opening_hutang' => $opening['total_hutang'],
                'opening_net' => $opening['total_piutang'] - $opening['total_hutang'],
                'new_piutang' => (float) $newActivity->where('type', 'piutang')->sum('amount'),
                'new_hutang' => (float) $newActivity->where('type', 'utang')->sum('amount'),
                'total_repayments' => (float) $transactions->sum('amount'),
            ],
            'activity' => [
                'new_loans' => LoanResource::collection($newActivity),
                'transactions' => $transactions->values(),
            ],
            'carry_over' => [
                'items' => $carryOver['items'],
                'total_piutang' => $carryOver['total_piutang'],
                'total_hutang' => $carryOver['total_hutang'],
            ],
        ], 'Laporan akuntabilitas periode ini sudah siap diverifikasi.');
    }

    /**
     * Helper to calculate loan balances at a specific point in time.
     *
     * @param  Collection<int, Loan>  $loans
     * @return array{items: array<int, array<string, mixed>>, total_piutang: float, total_hutang: float}
     */
    private function calculateBalancesAt(Collection $loans, Carbon $date): array
    {
        $items = [];
        $totalPiutang = 0;
        $totalHutang = 0;

        foreach ($loans as $loan) {
            // Only consider loans created on or before this date
            if ($loan->created_at->gt($date)) {
                continue;
            }

            // Calculate payments recorded on or before this date
            // Note: We use metadata->loan_id since it's indexed and reliable
            $repayments = Transaction::where('user_id', $loan->user_id)
                ->where('metadata->source_type', Loan::class)
                ->where('metadata->loan_id', $loan->id)
                ->where('date', '<=', $date->toDateString())
                ->where(function ($q) use ($loan) {
                    if ($loan->type === LoanType::RECEIVABLE) {
                        $q->where('type', TransactionType::INCOME);
                    } else {
                        $q->where('type', TransactionType::EXPENSE);
                    }
                })
                ->sum('amount');

            /** @var float $remaining */
            $remaining = max(0, $loan->amount - $repayments);

            if ($remaining > 0) {
                $items[] = [
                    'id' => $loan->id,
                    'contact_name' => $loan->contact_name,
                    'type' => $loan->type->value,
                    'amount' => $loan->amount,
                    'remaining_amount' => $remaining,
                    'due_date' => $loan->due_date,
                ];

                if ($loan->type === LoanType::RECEIVABLE) {
                    $totalPiutang += $remaining;
                } else {
                    $totalHutang += $remaining;
                }
            }
        }

        return [
            'items' => $items,
            'total_piutang' => $totalPiutang,
            'total_hutang' => $totalHutang,
        ];
    }

    /**
     * Delete a loan.
     */
    public function destroy(Loan $loan): JsonResponse
    {
        $this->authorize('delete', $loan);

        $loan->delete();

        return $this->success(null, 'Pinjaman sudah dihapus dari daftar ya. 👍', 204);
    }
}
