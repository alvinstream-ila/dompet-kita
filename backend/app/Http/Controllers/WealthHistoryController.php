<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;
use Carbon\Carbon;

class WealthHistoryController extends Controller
{
    public function index(Request $request)
    {
        $currentWealth = Asset::where('user_id', $request->user()->id)->sum('value');
        
        $history = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            // Mock growth: each previous month is roughly 5% less than the next
            $multiplier = pow(0.95, $i);
            $history[] = [
                'month' => $date->format('M'),
                'value' => (int)($currentWealth * $multiplier)
            ];
        }

        return $history;
    }
}
