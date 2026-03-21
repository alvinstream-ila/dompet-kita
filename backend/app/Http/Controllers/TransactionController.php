<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Enums\TransactionType;
use App\Http\Resources\TransactionResource;
use Illuminate\Validation\Rule;
use App\Services\BudgetService;
use App\Services\TransactionService;
use Illuminate\Support\Facades\Cache;

class TransactionController extends Controller
{
    protected BudgetService $budgetService;
    protected TransactionService $transactionService;

    public function __construct(BudgetService $budgetService, TransactionService $transactionService)
    {
        $this->budgetService = $budgetService;
        $this->transactionService = $transactionService;
    }
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $query = Transaction::where('user_id', $user->id);

            if ($request->has(['month', 'year'])) {
                $month = $request->filled('month') ? (int) $request->month : null;
                $year = $request->filled('year') ? (int) $request->year : null;
                $budgetCycleStart = (int) ($request->budget_cycle_start ?? 1);

                $dates = $this->budgetService->getBudgetCycleDates($month, $year, $budgetCycleStart);
                $query->whereBetween('date', [$dates['start'], $dates['end']]);
            }

            $transactions = $query->orderBy('date', 'desc')->paginate($request->input('limit', 20));
            return TransactionResource::collection($transactions);
        } catch (\Exception $e) {
            \Log::error('TRANSACTION_INDEX_ERROR: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user' => $request->user()?->id,
                'params' => $request->all()
            ]);
            return response()->json(['error' => 'Gagal mengambil data transaksi sayang. 🥺'], 500);
        }
    }

    public function summary(Request $request)
    {
        try {
            $user = $request->user();
            $month = $request->filled('month') ? (int) $request->month : null;
            $year = $request->filled('year') ? (int) $request->year : null;
            $budgetCycleStart = (int) ($request->budget_cycle_start ?? 1);

            $data = $this->transactionService->getSummary($user->id, $month, $year, $budgetCycleStart);

            return response()->json([
                'income' => $data['income'],
                'expense' => $data['expense'],
                'balance' => $data['balance'],
                'transactions' => TransactionResource::collection($data['recentTransactions']),
                'period' => $data['period']
            ]);
        } catch (\Exception $e) {
            \Log::error('TRANSACTION_SUMMARY_ERROR: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user' => $request->user()?->id,
                'params' => $request->all()
            ]);
            return response()->json(['error' => 'Gagal menghitung ringkasan transaksi sayang. 🥺'], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'amount' => 'required|numeric',
            'category' => 'required|string',
            'sub_category' => 'nullable|string',
            'type' => ['required', Rule::enum(TransactionType::class)],
            'description' => 'required|string',
            'note' => 'nullable|string',
            'receipt_url' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $transaction = Transaction::create($validated);

        Cache::forget("ai_insight_{$request->user()->id}");

        return (new TransactionResource($transaction))
                    ->response()
                    ->setStatusCode(201);
    }

    public function update(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'date' => 'sometimes|date',
            'amount' => 'sometimes|numeric',
            'category' => 'sometimes|string',
            'sub_category' => 'nullable|string',
            'type' => ['sometimes', Rule::enum(TransactionType::class)],
            'description' => 'sometimes|string',
            'note' => 'nullable|string',
            'receipt_url' => 'nullable|string',
        ]);

        $transaction->update($validated);
        Cache::forget("ai_insight_{$request->user()->id}");
        return new TransactionResource($transaction);
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $transaction->delete();
        Cache::forget("ai_insight_{$request->user()->id}");
        return response()->json(null, 204);
    }
}
