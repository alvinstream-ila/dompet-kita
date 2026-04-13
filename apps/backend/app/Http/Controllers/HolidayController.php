<?php

namespace App\Http\Controllers;

use App\Http\Resources\HolidayResource;
use App\Models\Asset;
use App\Models\Holiday;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

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

    /**
     * Fund a holiday (Accounting Protocol).
     */
    public function fund(Request $request, Holiday $holiday): JsonResponse
    {
        if ($holiday->user_id !== $request->user()->id) {
            \abort(403);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'asset_id' => 'nullable|exists:assets,id',
            'description' => 'nullable|string',
            'date' => 'required|date',
        ]);

        return DB::transaction(function () use ($validated, $holiday, $request) {
            // 1. Create the Holiday Transaction
            $holiday->transactions()->create([
                'user_id' => $request->user()->id,
                'asset_id' => $validated['asset_id'] ?? null,
                'amount' => $validated['amount'],
                'type' => 'funding',
                'description' => $validated['description'] ?? null,
                'transaction_date' => $validated['date'],
            ]);

            // 2. Update Holiday Funded Amount
            $holiday->increment('funded_amount', $validated['amount']);

            // 3. (Accounting Protocol) Deduct from Asset if specified
            if (! empty($validated['asset_id'])) {
                $asset = Asset::findOrFail($validated['asset_id']);
                $asset->decrement('value', $validated['amount']);
            }

            return \response()->json([
                'message' => 'Dana liburan berhasil ditambahkan! Semoga liburannya berkesan ya, Sayang! ✈️',
                'data' => new HolidayResource($holiday->load('transactions')),
            ]);
        });
    }

    /**
     * Get the transaction history for a holiday.
     */
    public function history(Request $request, Holiday $holiday): AnonymousResourceCollection
    {
        if ($holiday->user_id !== $request->user()->id) {
            \abort(403);
        }

        $history = $holiday->transactions()
            ->orderBy('transaction_date', 'desc')
            ->get();

        return HolidayResource::collection($history);
    }
}
