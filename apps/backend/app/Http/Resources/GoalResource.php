<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $name
 * @property float $target_amount
 * @property float $current_amount
 * @property Carbon|null $deadline
 * @property string $category
 * @property string $icon
 * @property string $status
 * @property string|null $note
 * @property Carbon $created_at
 */
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
            'deadline' => $this->deadline?->toDateString(),
            'category' => $this->category,
            'icon' => $this->icon ?? 'target',
            'status' => $this->status,
            'note' => $this->note,
            'progress_percentage' => (float) ($this->target_amount > 0
                ? ($this->current_amount / $this->target_amount) * 100
                : 0),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
