<?php

namespace App\Http\Controllers;

use App\Models\Holiday;
use Illuminate\Http\Request;

class HolidayController extends Controller
{
    public function index()
    {
        return Holiday::orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'destination' => 'required|string',
            'budget' => 'required|numeric',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'required|in:planning,completed,cancelled',
        ]);

        return Holiday::create($validated);
    }

    public function show(Holiday $holiday)
    {
        return $holiday;
    }

    public function update(Request $request, Holiday $holiday)
    {
        $validated = $request->validate([
            'destination' => 'sometimes|string',
            'budget' => 'sometimes|numeric',
            'status' => 'sometimes|in:planning,completed,cancelled',
        ]);

        $holiday->update($validated);
        return $holiday;
    }

    public function destroy(Holiday $holiday)
    {
        $holiday->delete();
        return response()->json(null, 204);
    }
}
