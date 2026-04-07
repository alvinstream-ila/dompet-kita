<?php

namespace App\Http\Controllers;

use App\Actions\Finance\Asset\CreateAssetAction;
use App\Actions\Finance\Asset\DeleteAssetAction;
use App\Actions\Finance\Asset\UpdateAssetAction;
use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Traits\HasApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Class AssetController
 * Manages user financial assets with strict ownership policies.
 */
class AssetController extends Controller
{
    use HasApiResponses;

    /**
     * List all assets for the authenticated user.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $assets = Asset::where('user_id', $request->user()->id)
            ->orderBy('type')
            ->get();

        return AssetResource::collection($assets);
    }

    /**
     * Store a new asset.
     */
    public function store(StoreAssetRequest $request, CreateAssetAction $action): JsonResponse
    {
        $asset = $action->execute($request->user(), $request->validated());

        return $this->success(new AssetResource($asset), 'Aset berhasil simpan ya Sayang! 💰', 201);
    }

    /**
     * Update an existing asset.
     */
    public function update(UpdateAssetRequest $request, Asset $asset, UpdateAssetAction $action): JsonResponse
    {
        $this->authorize('update', $asset);

        $asset = $action->execute($request->user(), $asset, $request->validated());

        return $this->success(new AssetResource($asset), 'Aset berhasil diupdate! Makin rapi deh keuangannya. ✨');
    }

    /**
     * Delete an asset.
     */
    public function destroy(Request $request, Asset $asset, DeleteAssetAction $action): JsonResponse
    {
        $this->authorize('delete', $asset);

        $action->execute($request->user(), $asset);

        return $this->success(null, 'Aset sudah dihapus ya Sayang. 👋', 204);
    }
}
