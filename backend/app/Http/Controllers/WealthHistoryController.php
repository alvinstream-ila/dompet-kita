<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\WealthHistory;
use App\Http\Resources\WealthHistoryResource;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class WealthHistoryController extends Controller
{
    /**
     * @OA\Get(
     *     path="/wealth-history",
     *     summary="Get historical wealth data",
     *     tags={"Wealth"},
     *     security={{"sanctum":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *         @OA\JsonContent(type="array", @OA\Items(ref="#/components/schemas/WealthHistoryResource"))
     *     )
     * )
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $now = Carbon::now();

        // Fetch historical data excluding current month
        $histories = WealthHistory::where('user_id', $user->id)
            ->where(function ($query) use ($now) {
                $query->where('year', '<', $now->year)
                    ->orWhere(function ($q) use ($now) {
                        $q->where('year', $now->year)
                            ->where('month', '<', $now->month);
                    });
            })
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(5)
            ->get();

        // Convert histories to resource collection
        $historyData = WealthHistoryResource::collection($histories->reverse())->toArray($request);

        // Always add current real asset sum as the latest point
        $currentWealth = Asset::where('user_id', $user->id)->sum('value');

        // Append current month data
        $historyData[] = [
            'month' => $now->format('M'),
            'value' => (int) $currentWealth,
            'year' => $now->year,
            'raw_month' => $now->month,
        ];

        return response()->json($historyData);
    }
}
