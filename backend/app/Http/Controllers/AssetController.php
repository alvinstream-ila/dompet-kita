<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use App\Models\WealthHistory;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function index(Request $request)
    {
        return Asset::where('user_id', $request->user()->id)->orderBy('type')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|string|max:50',
            'value' => 'required|numeric|min:0|max:1000000000000',
        ]);

        $validated['user_id'] = $request->user()->id;
        $asset = Asset::create($validated);
        $this->updateWealthSnapshot($request);
        return $asset;
    }

    public function update(Request $request, Asset $asset)
    {
        if ($asset->user_id !== $request->user()->id) abort(403);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'type' => 'sometimes|string|max:50',
            'value' => 'sometimes|numeric|min:0|max:1000000000000',
        ]);

        $asset->update($validated);
        $this->updateWealthSnapshot($request);
        return $asset;
    }

    public function destroy(Request $request, Asset $asset)
    {
        if ($asset->user_id !== $request->user()->id) abort(403);
        $asset->delete();
        $this->updateWealthSnapshot($request);
        return response()->json(null, 204);
    }

    private function updateWealthSnapshot(Request $request)
    {
        $user = $request->user();
        $month = now()->month;
        $year = now()->year;
        $total = Asset::where('user_id', $user->id)->sum('value');

        WealthHistory::updateOrCreate(
            ['user_id' => $user->id, 'month' => $month, 'year' => $year],
            ['total_value' => $total]
        );
    }
}
