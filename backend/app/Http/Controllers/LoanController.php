<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function index()
    {
        return Loan::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
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

        return Loan::create($validated);
    }

    public function show(Loan $loan)
    {
        return $loan;
    }

    public function update(Request $request, Loan $loan)
    {
        $validated = $request->validate([
            'amount' => 'sometimes|numeric',
            'remaining_amount' => 'sometimes|numeric',
            'description' => 'sometimes|string',
            'contact_name' => 'sometimes|string',
            'status' => 'sometimes|in:active,paid',
        ]);

        $loan->update($validated);
        return $loan;
    }

    public function destroy(Loan $loan)
    {
        $loan->delete();
        return response()->json(null, 204);
    }
}
