<?php

namespace App\Http\Resources;

use App\Models\Holiday;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $destination
 * @property float $budget
 * @property float $funded_amount
 * @property float $spent
 * @property Carbon|null $start_date
 * @property Carbon|null $end_date
 * @property string $status
 * @property string|null $itinerary
 * @property Carbon $created_at
 *
 * @mixin Holiday
 */
class HolidayResource extends JsonResource
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
            'destination' => $this->destination,
            'budget' => (float) $this->budget,
            'funded_amount' => (float) ($this->funded_amount ?? 0),
            'spent' => (float) ($this->spent ?? 0),
            'start_date' => $this->start_date instanceof Carbon ? $this->start_date->toDateString() : null,
            'end_date' => $this->end_date instanceof Carbon ? $this->end_date->toDateString() : null,
            'status' => (string) ($this->status ?? 'planning'),
            'itinerary' => (string) ($this->itinerary ?? ''),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
