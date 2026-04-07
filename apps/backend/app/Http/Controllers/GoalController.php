<?php

namespace App\Http\Controllers;

use App\Http\Resources\GoalResource;
use App\Models\Goal;
use App\Traits\HasApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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
     * Delete a goal.
     */
    public function destroy(Goal $goal): JsonResponse
    {
        $this->authorize('delete', $goal);

        $goal->delete();

        return $this->success(null, 'Target sudah dihapus. Mari buat target baru yang lebih keren! 👍', 204);
    }
}
