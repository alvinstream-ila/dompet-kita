<?php

namespace App\Http\Controllers;

use App\Http\Resources\HolidayResource;
use App\Models\Holiday;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class HolidayController extends Controller
{
    private const IMAGE_PROVIDER = 'https://loremflickr.com/1200/800/%s,landscape,travel';
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

        // Auto-generate image if not provided
        if (empty($validated['image_url'])) {
            $validated['image_url'] = $this->generateImageUrl($validated['destination']);
        }

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

        // Update image if destination changes and image_url wasn't manually updated
        if (isset($validated['destination']) && $validated['destination'] !== $holiday->destination) {
            $validated['image_url'] = $this->generateImageUrl($validated['destination']);
        }

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

    /**
     * Generate a thematic image URL based on destination.
     */
    private function generateImageUrl(string $destination): string
    {
        return sprintf(self::IMAGE_PROVIDER, urlencode($destination));
    }
}
