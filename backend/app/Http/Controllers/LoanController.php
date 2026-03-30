<?php

namespace App\Http\Controllers;

use App\Http\Resources\LoanResource;
use App\Models\Loan;
use Illuminate\Http\Request;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $loans = Loan::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return LoanResource::collection($loans);
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

        $loan = Loan::create($validated);

        return new LoanResource($loan);
    }

    public function show(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            \abort(403);
        }

        return new LoanResource($loan);
    }

    public function update(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            \abort(403);
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

        return new LoanResource($loan);
    }

    public function destroy(Request $request, Loan $loan)
    {
        if ($loan->user_id !== $request->user()->id) {
            \abort(403);
        }
        $loan->delete();

        return \response()->json(null, 204);
    }
}
