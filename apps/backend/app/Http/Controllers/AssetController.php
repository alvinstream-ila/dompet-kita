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
use App\Models\AssetTransaction;
use App\Models\User;
use App\Traits\HasApiResponses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

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
        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }

        $assets = Asset::where('user_id', $user->id)
            ->orderBy('type')
            ->get();

        return AssetResource::collection($assets);
    }

    /**
     * Store a new asset.
     */
    public function store(StoreAssetRequest $request, CreateAssetAction $action): JsonResponse
    {
        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }

        $asset = $action->execute($user, $request->validated());

        return $this->success(new AssetResource($asset), 'Aset berhasil simpan ya Sayang! 💰', 201);
    }

    /**
     * Update an existing asset.
     */
    public function update(UpdateAssetRequest $request, Asset $asset, UpdateAssetAction $action): JsonResponse
    {
        $this->authorize('update', $asset);
        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }

        $asset = $action->execute($user, $asset, $request->validated());

        return $this->success(new AssetResource($asset), 'Aset berhasil diupdate! Makin rapi deh keuangannya. ✨');
    }

    /**
     * Delete an asset.
     */
    public function destroy(Request $request, Asset $asset, DeleteAssetAction $action): JsonResponse
    {
        $this->authorize('delete', $asset);
        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }

        $action->execute($user, $asset);

        return $this->success(null, 'Aset sudah dihapus ya Sayang. 👋', 204);
    }

    /**
     * Fund an asset (Top up).
     */
    public function fund(Request $request, Asset $asset, FundAssetAction $action): JsonResponse
    {
        $this->authorize('update', $asset);
        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'source_asset_id' => 'sometimes|nullable|exists:assets,id',
            'description' => 'sometimes|nullable|string|max:255',
        ]);

        /** @var array{amount: float|int, source_asset_id?: int|string|null, description?: string} $data */
        $data = (array) $validated;

        $asset = $action->execute($user, $asset, $data);

        return $this->success(new AssetResource($asset), 'Top up aset berhasil! Saldo kamu sudah terupdate. 📈');
    }

    /**
     * Withdraw from an asset (Cairkan).
     */
    public function withdraw(Request $request, Asset $asset, WithdrawAssetAction $action): JsonResponse
    {
        $this->authorize('update', $asset);
        $user = $request->user();
        if (!$user instanceof User) {
            abort(401);
        }

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'recipient_asset_id' => 'sometimes|nullable|exists:assets,id',
            'description' => 'sometimes|nullable|string|max:255',
        ]);

        /** @var array{amount: float|int, recipient_asset_id?: int|string|null, description?: string} $data */
        $data = (array) $validated;

        $asset = $action->execute($user, $asset, $data);

        return $this->success(new AssetResource($asset), 'Pencairan aset berhasil! Uangnya sudah berpindah posisi. 💸');
    }

    /**
     * Get transaction history for an asset.
     */
    public function history(Request $request, Asset $asset): AnonymousResourceCollection
    {
        $this->authorize('view', $asset);

        /** @var LengthAwarePaginator<int, AssetTransaction> $transactions */
        $transactions = $asset->transactions()
            ->with(['sourceAsset'])
            ->orderByDesc('transaction_date')
            ->paginate();

        return AssetTransactionResource::collection($transactions);
    }
}
