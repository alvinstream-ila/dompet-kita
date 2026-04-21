<?php

namespace App\Http\Controllers;

use App\Actions\Finance\Transaction\DeleteTransactionAction;
use App\Actions\Finance\Transaction\GetTransactionSummaryAction;
use App\Actions\Finance\Transaction\StoreTransactionAction;
use App\Actions\Finance\Transaction\UpdateTransactionAction;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use App\Models\User;
use App\Services\BudgetService;
use App\Traits\HasApiResponses;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Mpdf\Mpdf;

/**
 * Class TransactionController
 * Core orchestration for user financial data movements.
 */
class TransactionController extends Controller
{
    use HasApiResponses;

    public function __construct(protected BudgetService $budgetService) {}

    /**
     * List all transactions with period filtering and pagination.
     */
    /**
     * List all transactions with period filtering and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (! $user instanceof User) {
                abort(401);
            }

            $query = Transaction::query()
                ->where('user_id', $user->id)
                ->filterByPeriod(
                    $request->filled('month') ? (int) $request->integer('month') : null,
                    $request->filled('year') ? (int) $request->integer('year') : null,
                    (int) ($request->integer('budget_cycle_start') ?: 1)
                );

            $limit = min((int) $request->integer('limit', 20), 100);
            $transactions = $query->orderBy('date', 'desc')->paginate($limit);

            return $this->success(TransactionResource::collection($transactions));
        } catch (\Exception $e) {
            Log::error('TRANSACTION_INDEX_ERROR: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user' => $request->user()?->id,
            ]);

            return $this->error('Gagal mengambil data transaksi sayang. 🥺', 500);
        }
    }

    /**
     * Get financial summary for the dashboard.
     */
    public function summary(Request $request, GetTransactionSummaryAction $action): JsonResponse
    {
        try {
            $user = $request->user();
            if (! $user instanceof User) {
                abort(401);
            }

            $month = $request->filled('month') ? (int) $request->integer('month') : null;
            $year = $request->filled('year') ? (int) $request->integer('year') : null;
            $budgetCycleStart = (int) ($request->integer('budget_cycle_start') ?: 1);

            /**
             * @return array{
             *     income: float,
             *     expense: float,
             *     balance: float,
             *     cumulative_balance: float,
             *     calendar_income: float,
             *     calendar_expense: float,
             *     recentTransactions: Collection<int, Transaction>,
             *     period: array{start: string, end: string}
             * }
             */
            $data = $action->execute($user->id, $month, $year, $budgetCycleStart);

            return $this->success([
                'income' => $data['income'],
                'expense' => $data['expense'],
                'balance' => $data['balance'],
                'cumulative_balance' => $data['cumulative_balance'],
                'calendar_income' => $data['calendar_income'],
                'calendar_expense' => $data['calendar_expense'],
                'transactions' => TransactionResource::collection($data['recentTransactions']),
                'period' => $data['period'],
            ], 'Summary terhitung rapi ya Sayang! 📊');
        } catch (\Exception $e) {
            Log::error('TRANSACTION_SUMMARY_ERROR: '.$e->getMessage());

            return $this->error('Gagal menghitung ringkasan transaksi sayang. 🥺', 500);
        }
    }

    /**
     * Store a new transaction.
     */
    public function store(StoreTransactionRequest $request, StoreTransactionAction $action): JsonResponse
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $transaction = $action->execute($user, $request->validated());

        return $this->success(new TransactionResource($transaction), 'Transaksi berhasil dicatat! ❤️', 201);
    }

    /**
     * Update an existing transaction.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction, UpdateTransactionAction $action): JsonResponse
    {
        $this->authorize('update', $transaction);

        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $transaction = $action->execute($user, $transaction, $request->validated());

        return $this->success(new TransactionResource($transaction), 'Catatan transaksinya sudah aku update ya! ✨');
    }

    public function monthlyStatement(Request $request, GetTransactionSummaryAction $action): JsonResponse|Response
    {
        /** @var User $user */
        $user = $request->user();

        $month = $request->integer('month', now()->month);
        $year = $request->filled('year') ? (int) $request->integer('year') : (int) date('Y');
        $budgetCycleStart = (int) ($request->integer('budget_cycle_start') ?: 1);

        $viewData = $this->prepareTransactionReportData($user, $month, $year, $budgetCycleStart, $action);

        $html = view('reports.financial_monthly', $viewData)->render();

        $mpdf = new Mpdf([
            'tempDir' => storage_path('app/mpdf'),
            'margin_left' => 0,
            'margin_right' => 0,
            'margin_top' => 0,
            'margin_bottom' => 0,
        ]);

        $mpdf->WriteHTML($html);

        $fileName = "Monthly_Statement_{$year}_{$month}.pdf";

        return response($mpdf->Output($fileName, 'S'), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "inline; filename=\"{$fileName}\"",
        ]);
    }

    /**
     * Prepare the core data for the transaction report.
     *
     * @return array{
     *   user: User,
     *   summary: array<string, mixed>,
     *   transactions: Collection<int, Transaction>,
     *   categories: \Illuminate\Support\Collection<int, mixed>,
     *   period_label: string
     * }
     */
    private function prepareTransactionReportData(User $user, int $month, int $year, int $budgetCycleStart, GetTransactionSummaryAction $action): array
    {
        /** @var array<string, mixed> $summaryData */
        $summaryData = $action->execute($user->id, $month, $year, $budgetCycleStart);

        /** @var array{start: Carbon, end: Carbon} $period */
        $period = $this->budgetService->getBudgetCycleDates($month, $year, $budgetCycleStart);

        $transactions = Transaction::where('user_id', $user->id)
            ->whereBetween('date', [$period['start'], $period['end']])
            ->orderBy('date', 'desc')
            ->get();

        /** @var \Illuminate\Support\Collection<int, mixed> $categoryBreakdown */
        $categoryBreakdown = $transactions->groupBy('category')->map(function (Collection $items, $key) {
            /** @var Transaction $first */
            $first = $items->first();

            return [
                'category' => $key,
                'amount' => (float) $items->sum('amount'),
                'type' => $first->type->value,
            ];
        })->values()->sortByDesc('amount');

        return [
            'user' => $user,
            'summary' => $summaryData,
            'transactions' => $transactions,
            'categories' => $categoryBreakdown,
            'period_label' => $period['start']->translatedFormat('F Y'),
        ];
    }

    /**
     * Delete a transaction.
     */
    public function destroy(Request $request, Transaction $transaction, DeleteTransactionAction $action): JsonResponse
    {
        $this->authorize('delete', $transaction);

        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $action->execute($user, $transaction);

        return $this->success(null, 'Oke, transaksinya sudah dihapus. 👌');
    }
}
