<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GoalResource extends JsonResource
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
            'target_amount' => (float) $this->target_amount,
            'current_amount' => (float) ($this->current_amount ?? 0),
            'target_date' => $this->target_date?->toDateString(),
            'category' => $this->category,
            'status' => $this->status,
            'note' => $this->note,
            'progress_percentage' => (float) ($this->target_amount > 0 
                ? round(($this->current_amount / $this->target_amount) * 100, 2) 
                : 0),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
