<?php

namespace App\Http\Controllers;

use App\Actions\Finance\Asset\CreateAssetAction;
use App\Actions\Finance\Asset\DeleteAssetAction;
use App\Actions\Finance\Asset\FundAssetAction;
use App\Actions\Finance\Asset\UpdateAssetAction;
use App\Actions\Finance\Asset\WithdrawAssetAction;
use App\Http\Requests\StoreAssetRequest;
use App\Http\Requests\UpdateAssetRequest;
use App\Http\Resources\AssetResource;
use App\Http\Resources\AssetTransactionResource;
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

    /**
     * Fund an asset (Top up).
     */
    public function fund(Request $request, Asset $asset, FundAssetAction $action): JsonResponse
    {
        $this->authorize('update', $asset);

        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'source_asset_id' => 'sometimes|nullable|exists:assets,id',
            'description' => 'sometimes|nullable|string|max:255',
        ]);

        $asset = $action->execute($request->user(), $asset, $request->all());

        return $this->success(new AssetResource($asset), 'Top up aset berhasil! Saldo kamu sudah terupdate. 📈');
    }

    /**
     * Withdraw from an asset (Cairkan).
     */
    public function withdraw(Request $request, Asset $asset, WithdrawAssetAction $action): JsonResponse
    {
        $this->authorize('update', $asset);

        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'recipient_asset_id' => 'sometimes|nullable|exists:assets,id',
            'description' => 'sometimes|nullable|string|max:255',
        ]);

        $asset = $action->execute($request->user(), $asset, $request->all());

        return $this->success(new AssetResource($asset), 'Pencairan aset berhasil! Uangnya sudah berpindah posisi. 💸');
    }

    /**
     * Get transaction history for an asset.
     */
    public function history(Request $request, Asset $asset): AnonymousResourceCollection
    {
        $this->authorize('view', $asset);

        $transactions = $asset->transactions()
            ->with(['sourceAsset'])
            ->orderByDesc('transaction_date')
            ->paginate();

        return AssetTransactionResource::collection($transactions);
    }
}
