<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $query = Transaction::where('user_id', $user->id);

            if ($request->has(['month', 'year'])) {
                $month = (int) $request->month + 1;
                $year = (int) $request->year;
                $budgetCycleStart = (int) ($request->budget_cycle_start ?? 1);

                $currentMonthDate = Carbon::create($year, $month, 15);

                if ($budgetCycleStart === 1) {
                    $startDate = $currentMonthDate->copy()->startOfMonth();
                    $endDate = $currentMonthDate->copy()->endOfMonth();
                } else {
                    $endDate = Carbon::create($year, $month, $budgetCycleStart - 1)->endOfDay();
                    $startDate = $endDate->copy()->subMonth()->addDay()->startOfDay();
                }

                $query->whereBetween('date', [$startDate, $endDate]);
            }

            return $query->orderBy('date', 'desc')->paginate($request->input('limit', 20));
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
            $month = (int) ($request->month ?? now()->month - 1) + 1;
            $year = (int) ($request->year ?? now()->year);
            $budgetCycleStart = (int) ($request->budget_cycle_start ?? 1);

            $currentMonthDate = Carbon::create($year, $month, 15);

            if ($budgetCycleStart === 1) {
                $startDate = $currentMonthDate->copy()->startOfMonth();
                $endDate = $currentMonthDate->copy()->endOfMonth();
            } else {
                $endDate = Carbon::create($year, $month, $budgetCycleStart - 1)->endOfDay();
                $startDate = $endDate->copy()->subMonth()->addDay()->startOfDay();
            }

            $summary = Transaction::where('user_id', $user->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->select('type', DB::raw('SUM(amount) as total'))
                ->groupBy('type')
                ->get();

            $income = $summary->where('type', 'income')->first()?->total ?? 0;
            $expense = $summary->where('type', 'expense')->first()?->total ?? 0;

            $recentTransactions = Transaction::where('user_id', $user->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->orderBy('date', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'income' => (float) $income,
                'expense' => (float) $expense,
                'balance' => (float) ($income - $expense),
                'transactions' => $recentTransactions,
                'period' => [
                    'start' => $startDate->toIso8601String(),
                    'end' => $endDate->toIso8601String(),
                ]
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
            'type' => 'required|string|in:income,expense',
            'description' => 'required|string',
            'note' => 'nullable|string',
            'receipt_url' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;
        $transaction = Transaction::create($validated);

        return response()->json($transaction, 201);
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
            'type' => 'sometimes|string|in:income,expense',
            'description' => 'sometimes|string',
            'note' => 'nullable|string',
            'receipt_url' => 'nullable|string',
        ]);

        $transaction->update($validated);
        return response()->json($transaction);
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $transaction->delete();
        return response()->json(null, 204);
    }
}
