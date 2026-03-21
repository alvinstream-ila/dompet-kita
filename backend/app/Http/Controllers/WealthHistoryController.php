<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\WealthHistory;
use Illuminate\Http\Request;
use Carbon\Carbon;

class WealthHistoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now();
        
        // Fetch historical data excluding current month
        $histories = WealthHistory::where('user_id', $user->id)
            ->where(function($query) use ($now) {
                $query->where('year', '<', $now->year)
                      ->orWhere(function($q) use ($now) {
                          $q->where('year', $now->year)
                            ->where('month', '<', $now->month);
                      });
            })
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->limit(5)
            ->get()
            ->reverse();

        $formattedHistory = $histories->map(function($h) {
            return [
                'month' => Carbon::create($h->year, $h->month, 1)->format('M'),
                'value' => (int) $h->total_value
            ];
        })->values()->toArray();

        // Always add current real asset sum as the latest point
        $currentWealth = Asset::where('user_id', $user->id)->sum('value');
        
        $formattedHistory[] = [
            'month' => $now->format('M'),
            'value' => (int) $currentWealth
        ];

        return response()->json($formattedHistory);
    }
}
