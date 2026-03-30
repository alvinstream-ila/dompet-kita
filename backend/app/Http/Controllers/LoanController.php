<?php

namespace App\Http\Controllers;

use App\Models\Loan;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        return Loan::where('user_id', $request->user()->id)->orderBy('created_at', 'desc')->get();
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

        $validated['user_id'] = $request->user()->id;

        return Loan::create($validated);
    }

    public function show(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            abort(403);
        }

        return $loan;
    }

    public function update(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            abort(403);
        }

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

        return $loan;
    }

    public function destroy(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            abort(403);
        }
        $loan->delete();

        return response()->json(null, 204);
    }
}
