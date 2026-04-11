<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\Goal;
use App\Models\GoalTransaction;
use App\Traits\HasApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class GoalController extends Controller
{
    use HasApiResponses;

    /**
     * List all goals for the authenticated user.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $goals = Goal::where('user_id', $request->user()->id)
            ->orderBy('deadline', 'asc')
            ->get();

        return GoalResource::collection($goals);
    }

    /**
     * Store a new goal.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'target_amount' => 'required|numeric',
            'current_amount' => 'required|numeric',
            'deadline' => 'nullable|date',
            'category' => 'nullable|string',
            'icon' => 'nullable|string',
            'status' => 'required|in:active,completed,cancelled',
        ]);

        $validated['user_id'] = $request->user()->id;

        $goal = Goal::create($validated);

        return $this->success(new GoalResource($goal), 'Target tabungan baru sudah aku buatkan ya Sayang! Semangat! 🎯', 201);
    }

    /**
     * Update an existing goal.
     */
    public function update(Request $request, Goal $goal): JsonResponse
    {
        $this->authorize('update', $goal);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'target_amount' => 'sometimes|numeric',
            'current_amount' => 'sometimes|numeric',
            'deadline' => 'sometimes|nullable|date',
            'category' => 'sometimes|nullable|string',
            'icon' => 'sometimes|nullable|string',
            'status' => 'sometimes|in:active,completed,cancelled',
        ]);

        $goal->update($validated);

        return $this->success(new GoalResource($goal), 'Targetnya sudah aku update ya! ✨');
    }

    /**
     * Deposit funds into a goal.
     */
    public function deposit(Request $request, Goal $goal): JsonResponse
    {
        $this->authorize('update', $goal);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'asset_id' => 'nullable|exists:assets,id',
            'description' => 'nullable|string',
            'date' => 'required|date',
        ]);

        return DB::transaction(function () use ($validated, $goal, $request) {
            // 1. Create the Goal Transaction
            $goal->transactions()->create([
                'user_id' => $request->user()->id,
                'asset_id' => $validated['asset_id'] ?? null,
                'amount' => $validated['amount'],
                'type' => 'deposit',
                'description' => $validated['description'] ?? null,
                'date' => $validated['date'],
            ]);

            // 2. Update Goal Balance
            $goal->increment('current_amount', $validated['amount']);

            // 3. (Accounting Protocol) Deduct from Asset if specified
            if (!empty($validated['asset_id'])) {
                $asset = Asset::findOrFail($validated['asset_id']);
                $asset->decrement('value', $validated['amount']);
            }

            return $this->success(
                new GoalResource($goal->load('transactions')),
                'Mimpi kita selangkah lebih dekat, Sayang! Semangat nabungnya ya! ❤️'
            );
        });
    }

    /**
     * Get the transaction history for a goal.
     */
    public function history(Request $request, Goal $goal): AnonymousResourceCollection
    {
        $this->authorize('view', $goal);

        $history = $goal->transactions()
            ->orderBy('date', 'desc')
            ->get();

        return GoalResource::collection($history); // We might need a separate GoalTransactionResource, but GoalResource is fine for now if we customize it or use AnonymousResourceCollection
    }

    /**
     * Delete a goal.
     */
    public function destroy(Goal $goal): JsonResponse
    {
        $this->authorize('delete', $goal);

        $goal->delete();

        return $this->success(null, 'Target sudah dihapus. Mari buat target baru yang lebih keren! 👍', 204);
    }
}
