<?php

declare(strict_types=1);

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
use Illuminate\Http\Response;
use Illuminate\Support\Collection;
use Mpdf\Mpdf;

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

        $loans = Loan::query()
            ->where('household_id', $user->household_id)
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
        $validated['household_id'] = $user->household_id;

        $loan = Loan::create($validated);

        return $this->success(new LoanResource($loan), 'Instrumen kewajiban/piutang baru telah diarsip.', 201);
    }

    /**
     * Show a specific loan.
     */
    public function show(Loan $loan): JsonResponse
    {
        $this->authorize('view', $loan);

        return $this->success(new LoanResource($loan), 'Detail ekposur pinjaman berhasil dimuat.');
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

        return $this->success(new LoanResource($loan), 'Parameter instrumen pinjaman telah diperbarui.');
    }

    /**
     * Generate a loan accountability report for a specific period.
     */
    public function report(Request $request): JsonResponse|Response
    {
        /** @var User $user */
        $user = $request->user();

        $month = $request->integer('month', now()->month);
        $year = $request->integer('year', now()->year);

        $reportData = $this->prepareReportData($user, $month, $year);

        // Handle PDF Format
        if ($request->query('format') === 'pdf') {
            $viewData = array_merge($reportData, ['user' => $user]);
            $html = view('reports.loan_accountability', $viewData)->render();

            $mpdf = new Mpdf([
                'tempDir' => storage_path('app/mpdf'),
                'margin_left' => 0,
                'margin_right' => 0,
                'margin_top' => 0,
                'margin_bottom' => 0,
            ]);

            $mpdf->WriteHTML($html);

            $fileName = "Loan_Accountability_Report_{$year}_{$month}.pdf";

            return response($mpdf->Output($fileName, 'S'), 200, [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => "inline; filename=\"{$fileName}\"",
            ]);
        }

        return $this->success($reportData, 'Laporan akuntabilitas periode ini telah diverifikasi dan siap ditinjau.');
    }

    /**
     * Delete a loan.
     */
    public function destroy(Loan $loan): JsonResponse
    {
        $this->authorize('delete', $loan);

        $loan->delete();

        return $this->success(null, 'Instrumen pinjaman telah dihapus dari sistem.', 204);
    }

    /**
     * Prepare the core data for the loan report.
     *
     * @return array{
     *   period: array{month: int, year: int, label: string},
     *   summary: array{opening_piutang: float, opening_hutang: float, opening_net: float, new_piutang: float, new_hutang: float, total_repayments: float},
     *   activity: array{new_loans: AnonymousResourceCollection, transactions: Collection<int, Transaction>},
     *   carry_over: array{items: array<int, array<string, mixed>>, total_piutang: float, total_hutang: float}
     * }
     */
    private function prepareReportData(User $user, int $month, int $year): array
    {
        $startDate = Carbon::create($year, $month, 1)?->startOfMonth() ?? now()->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();

        // 1. Fetch loans active during or before this month (Household Scoped)
        $loans = Loan::query()
            ->where('household_id', $user->household_id)
            ->where('created_at', '<=', $endDate)
            ->where(function ($query) use ($startDate): void {
                $query->where('status', 'active')
                    ->orWhere('updated_at', '>=', $startDate);
            })
            ->get();

        // 2. Fetch all transactions linked to loans in this month (Household Scoped)
        $transactions = Transaction::query()
            ->where('household_id', $user->household_id)
            ->whereBetween('date', [$startDate, $endDate])
            ->whereNotNull('metadata')
            ->get()
            ->filter(function (Transaction $t): bool {
                /** @var array<string, mixed>|null $metadata */
                $metadata = $t->metadata;

                return is_array($metadata) && ($metadata['source_type'] ?? null) === Loan::class;
            });

        // 3. Calculate Opening Balances (Snapshot at start of month)
        $opening = $this->calculateBalancesAt($loans, $startDate->copy()->subDay());

        // 4. Summarize new activity in this month
        $newActivity = $loans->filter(fn ($l) => $l->created_at->between($startDate, $endDate));

        // 5. Carry-over details (Ending Balance Snapshot)
        $carryOver = $this->calculateBalancesAt($loans, $endDate);

        return [
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
        ];
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

        if ($loans->isEmpty()) {
            return [
                'items' => $items,
                'total_piutang' => $totalPiutang,
                'total_hutang' => $totalHutang,
            ];
        }

        // Gather loan IDs as strings to prevent Postgres json = integer type mismatch
        $loanIds = $loans->pluck('id')->map(fn ($id): string => (string) $id)->toArray();

        // Fetch all relevant repayments for these loans up to the specified date in one query
        $repayments = Transaction::query()
            ->where('household_id', $loans->first()->household_id) // Explicit scoping
            ->where('metadata->source_type', Loan::class)
            ->whereIn('metadata->loan_id', $loanIds)
            ->where('date', '<=', $date->toDateString())
            ->get()
            ->groupBy(function ($t): string {
                /** @var array<string, mixed>|null $metadata */
                $metadata = $t->metadata;

                return is_array($metadata) ? (string) ($metadata['loan_id'] ?? '') : '';
            });

        foreach ($loans as $loan) {
            // Only consider loans created on or before this date
            if ($loan->created_at->gt($date)) {
                continue;
            }

            // Get repayments for this specific loan
            $loanRepayments = $repayments->get((string) $loan->id, collect());

            // Calculate valid payments based on loan type
            $validRepayments = $loanRepayments->filter(function ($t) use ($loan): bool {
                if ($loan->type === LoanType::RECEIVABLE) {
                    return $t->type === TransactionType::INCOME;
                }

                return $t->type === TransactionType::EXPENSE;
            });

            $repaymentsAmount = (float) $validRepayments->sum('amount');

            /** @var float $remaining */
            $remaining = max(0, $loan->amount - $repaymentsAmount);

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
}
