<?php

namespace App\Http\Controllers;

use App\Http\Resources\LoanResource;
use App\Models\Loan;
use App\Models\User;
use App\Traits\HasApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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
     * Delete a loan.
     */
    public function destroy(Loan $loan): JsonResponse
    {
        $this->authorize('delete', $loan);

        $loan->delete();

        return $this->success(null, 'Pinjaman sudah dihapus dari daftar ya. 👍', 204);
    }
}
