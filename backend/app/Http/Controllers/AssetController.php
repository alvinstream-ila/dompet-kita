<?php

namespace App\Http\Controllers;

use App\Models\Asset;
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
            'name' => 'required|string',
            'type' => 'required|string',
            'value' => 'required|numeric',
        ]);

        $validated['user_id'] = $request->user()->id;
        return Asset::create($validated);
    }

    public function update(Request $request, Asset $asset)
    {
        if ($asset->user_id !== $request->user()->id) abort(403);

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'type' => 'sometimes|string',
            'value' => 'sometimes|numeric',
        ]);

        $asset->update($validated);
        return $asset;
    }

    public function destroy(Request $request, Asset $asset)
    {
        if ($asset->user_id !== $request->user()->id) abort(403);
        $asset->delete();
        return response()->json(null, 204);
    }
}
