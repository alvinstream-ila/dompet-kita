<?php

namespace App\Http\Controllers;

use App\Http\Resources\HolidayResource;
use App\Models\Holiday;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;

class HolidayController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $holidays = Holiday::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return HolidayResource::collection($holidays);
    }

    public function store(Request $request): HolidayResource
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

        $holiday = Holiday::create($validated);

        return new HolidayResource($holiday);
    }

    public function show(Request $request, Holiday $holiday): HolidayResource
    {
        if ($holiday->user_id !== $request->user()->id) {
            \abort(403);
        }

        return new HolidayResource($holiday);
    }

    public function update(Request $request, Holiday $holiday): HolidayResource
    {
        if ($holiday->user_id !== $request->user()->id) {
            \abort(403);
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

        return new HolidayResource($holiday);
    }

    public function destroy(Request $request, Holiday $holiday): JsonResponse
    {
        if ($holiday->user_id !== $request->user()->id) {
            \abort(403);
        }
        $holiday->delete();

        return \response()->json(null, 204);
    }
}
