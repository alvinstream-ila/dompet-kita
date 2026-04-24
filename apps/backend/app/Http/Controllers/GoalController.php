<?php

namespace App\Http\Controllers;

use App\Http\Resources\GoalResource;
use App\Models\Asset;
use App\Models\Goal;
use App\Models\User;
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
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $goals = Goal::orderBy('deadline', 'asc')
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

        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $goal = Goal::create($validated);

        return $this->success(new GoalResource($goal), 'Objektif finansial strategis baru telah diinisialisasi.', 201);
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

        return $this->success(new GoalResource($goal), 'Parameter objektif finansial telah diperbarui.');
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
            $user = $request->user();
            if (! $user instanceof User) {
                abort(401);
            }

            // 1. Create the Goal Transaction
            $goal->transactions()->create([
                'user_id' => $user->id,
                'asset_id' => $validated['asset_id'] ?? null,
                'amount' => $validated['amount'],
                'type' => 'deposit',
                'description' => $validated['description'] ?? null,
                'date' => $validated['date'],
            ]);

            // 2. Update Goal Balance
            $goal->increment('current_amount', $validated['amount']);

            // 3. (Accounting Protocol) Deduct from Asset if specified
            if (! empty($validated['asset_id'])) {
                $asset = Asset::findOrFail($validated['asset_id']);
                assert($asset instanceof Asset);
                $asset->decrement('value', $validated['amount']);
            }

            return $this->success(
                new GoalResource($goal->load('transactions')),
                'Alokasi modal ke instrumen objektif telah berhasil direkonsiliasi.'
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

        return GoalResource::collection($history);
    }

    /**
     * Delete a goal.
     */
    public function destroy(Goal $goal): JsonResponse
    {
        $this->authorize('delete', $goal);

        $goal->delete();

        return $this->success(null, 'Objektif finansial telah dihapus dari sistem.', 204);
    }
}
