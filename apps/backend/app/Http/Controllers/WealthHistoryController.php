<?php

namespace App\Http\Controllers;

use App\Http\Resources\WealthHistoryResource;
use App\Models\Asset;
use App\Models\WealthHistory;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WealthHistoryController extends Controller
{
    /**
     * Get historical wealth data
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

        // Convert histories to resource collection and then to array
        $historyData = WealthHistoryResource::collection($histories->reverse())->toArray($request);

        // Always add current real asset sum as the latest point
        $currentWealth = Asset::where('user_id', $user->id)->sum('value');

        // Append current month data using the Resource to keep it consistent
        $nowResource = new WealthHistoryResource([
            'month' => $now->format('M'),
            'value' => (float) $currentWealth,
            'year' => $now->year,
            'raw_month' => $now->month,
        ]);

        $historyData[] = $nowResource->toArray($request);

        return \response()->json($historyData);
    }
}
