<?php

namespace App\Http\Resources;

use App\Models\AssetTransaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin AssetTransaction
 */
class AssetTransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset_id' => $this->asset_id,
            'source_asset' => new AssetResource($this->whenLoaded('sourceAsset')),
            'amount' => $this->amount,
            'type' => $this->type,
            'description' => $this->description,
            'transaction_date' => $this->transaction_date->toIso8601String(),
            'created_at' => ($this->created_at ?? now())->toIso8601String(),
        ];
    }
}
