<?php

namespace App\Http\Controllers;

use App\Http\Resources\GoalResource;
use App\Models\Goal;
use Illuminate\Http\Request;

class GoalController extends Controller
{
    public function index(Request $request)
    {
        $goals = Goal::where('user_id', $request->user()->id)
            ->orderBy('deadline', 'asc')
            ->get();

        return GoalResource::collection($goals);
    }

    public function store(Request $request)
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

        return new GoalResource($goal);
    }

    public function update(Request $request, Goal $goal)
    {
        if ($goal->user_id !== $request->user()->id) {
            \abort(403);
        }

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

        return new GoalResource($goal);
    }

    public function destroy(Request $request, Goal $goal)
    {
        if ($goal->user_id !== $request->user()->id) {
            \abort(403);
        }
        $goal->delete();

        return \response()->json(null, 204);
    }
}
