<?php

namespace App\Http\Controllers;

use App\Http\Resources\HolidayResource;
use App\Models\Asset;
use App\Models\Holiday;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class HolidayController extends Controller
{
    private const IMAGE_PROVIDER = 'https://loremflickr.com/1200/800/%s,landscape,travel';

    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        $holidays = Holiday::orderBy('created_at', 'desc')
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

        $user = $request->user();
        if (! $user instanceof User) {
            abort(401);
        }

        // Auto-generate image if not provided
        if (empty($validated['image_url'])) {
            $validated['image_url'] = $this->generateImageUrl((string) $request->string('destination'));
        }

        $holiday = Holiday::create($validated);

        return new HolidayResource($holiday);
    }

    public function show(Request $request, Holiday $holiday): HolidayResource
    {
        $this->authorize('view', $holiday);

        return new HolidayResource($holiday);
    }

    public function update(Request $request, Holiday $holiday): HolidayResource
    {
        $this->authorize('update', $holiday);

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
            $validated['image_url'] = $this->generateImageUrl((string) $request->string('destination'));
        }

        $holiday->update($validated);

        return new HolidayResource($holiday);
    }

    public function destroy(Request $request, Holiday $holiday): JsonResponse
    {
        $this->authorize('delete', $holiday);
        $holiday->delete();

        return \response()->json(null, 204);
    }

    /**
     * Fund a holiday (Accounting Protocol).
     */
    public function fund(Request $request, Holiday $holiday): JsonResponse
    {
        $this->authorize('update', $holiday);
        $user = $request->user();

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'asset_id' => 'nullable|exists:assets,id',
            'description' => 'nullable|string',
            'date' => 'required|date',
        ]);

        return DB::transaction(function () use ($validated, $holiday, $user) {
            // 1. Create the Holiday Transaction
            $holiday->transactions()->create([
                // user_id is creator, handled by trait usually but explicit is fine here for clear record
                'user_id' => $user instanceof User ? $user->id : $holiday->user_id,
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
                /** @var Asset $asset */
                $asset = Asset::findOrFail($validated['asset_id']);
                $asset->decrement('value', (float) $validated['amount']);
            }

            return \response()->json([
                'message' => 'Alokasi dana rekreasi/liburan berhasil diproses. Matriks pendanaan objektif telah diperbarui.',
                'data' => new HolidayResource($holiday->load('transactions')),
            ]);
        });
    }

    /**
     * Get the transaction history for a holiday.
     */
    public function history(Request $request, Holiday $holiday): AnonymousResourceCollection
    {
        $this->authorize('view', $holiday);

        $history = $holiday->transactions()
            ->orderBy('transaction_date', 'desc')
            ->get();

        return HolidayResource::collection($history);
    }

    /**
     * Generate a thematic image URL based on destination.
     */
    private function generateImageUrl(string $destination): string
    {
        return sprintf(self::IMAGE_PROVIDER, urlencode($destination));
    }
}
