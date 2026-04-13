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
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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

            /** @var array{income: float|int, expense: float|int, balance: float|int, recentTransactions: Collection<int, Transaction>, period: string} $data */
            $data = $action->execute($user->id, $month, $year, $budgetCycleStart);

            return $this->success([
                'income' => $data['income'],
                'expense' => $data['expense'],
                'balance' => $data['balance'],
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
