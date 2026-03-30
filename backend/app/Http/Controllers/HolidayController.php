<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    public function index(Request $request)
    {
        return Holiday::where('user_id', $request->user()->id)->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'destination' => 'required|string',
            'budget' => 'required|numeric',
            'spent' => 'nullable|numeric',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'required|in:planning,booked,completed,cancelled',
            'itinerary' => 'nullable|string',
        ]);

        $validated['user_id'] = $request->user()->id;

        return Holiday::create($validated);
    }

    public function show(Request $request, Holiday $holiday)
    {
        if ($holiday->user_id !== $request->user()->id) {
            abort(403);
        }

        return $holiday;
    }

    public function update(Request $request, Holiday $holiday)
    {
        if ($holiday->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'destination' => 'sometimes|string',
            'budget' => 'sometimes|numeric',
            'spent' => 'sometimes|numeric',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date',
            'status' => 'sometimes|in:planning,booked,completed,cancelled',
            'itinerary' => 'sometimes|nullable|string',
        ]);

        $holiday->update($validated);

        return $holiday;
    }

    public function destroy(Request $request, Holiday $holiday)
    {
        if ($holiday->user_id !== $request->user()->id) {
            abort(403);
        }
        $holiday->delete();

        return response()->json(null, 204);
    }
}
