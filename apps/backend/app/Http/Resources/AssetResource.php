<?php

namespace App\Http\Resources;

use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Asset
 */
class AssetResource extends JsonResource
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
            'name' => $this->name,
            'type' => $this->type,
            'unit' => $this->unit,
            'is_market_synced' => $this->is_market_synced,
            'value' => (float) $this->value,
            'invested_capital' => (float) $this->invested_capital,
            'profit_amount' => (float) ($this->value - $this->invested_capital),
            'profit_percent' => $this->invested_capital > 0 
                ? round((($this->value - $this->invested_capital) / $this->invested_capital) * 100, 2) 
                : 0,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
