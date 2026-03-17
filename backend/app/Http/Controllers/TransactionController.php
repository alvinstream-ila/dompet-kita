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
        $query = Transaction::query();

        // Optional filtering by month and year
        if ($request->has(['month', 'year'])) {
            $month = (int) $request->month + 1; // Frontend uses 0-indexed month
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

        return $query->orderBy('date', 'desc')->paginate($request->get('limit', 20));
    }

    public function summary(Request $request)
    {
        $month = (int) $request->month + 1; // Frontend uses 0-indexed month
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

        $summary = Transaction::whereBetween('date', [$startDate, $endDate])
            ->select('type', DB::raw('SUM(amount) as total'))
            ->groupBy('type')
            ->get();

        $income = $summary->where('type', 'income')->first()?->total ?? 0;
        $expense = $summary->where('type', 'expense')->first()?->total ?? 0;

        return response()->json([
            'income' => (float) $income,
            'expense' => (float) $expense,
            'balance' => (float) ($income - $expense),
            'period' => [
                'start' => $startDate->toIso8601String(),
                'end' => $endDate->toIso8601String(),
            ]
        ]);
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

        $transaction = Transaction::create($validated);

        return response()->json($transaction, 201);
    }

    public function update(Request $request, Transaction $transaction)
    {
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

    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return response()->json(null, 204);
    }
}
