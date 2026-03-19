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
        
        // Fetch historical data from the new table
        // We look for last 6 months
        $histories = WealthHistory::where('user_id', $user->id)
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

        // Always add current month's real asset sum as the latest point
        $currentWealth = Asset::where('user_id', $user->id)->sum('value');
        
        $formattedHistory[] = [
            'month' => Carbon::now()->format('M'),
            'value' => (int) $currentWealth
        ];

        return $formattedHistory;
    }
}
