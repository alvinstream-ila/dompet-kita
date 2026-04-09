<?php

namespace App\Http\Resources;

use App\Models\WealthHistory;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin WealthHistory
 */
class WealthHistoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Check if $this is actually a WealthHistory model or a manually constructed array for the current month
        if (is_array($this->resource)) {
            return $this->resource;
        }

        return [
            'month' => Carbon::create($this->year, $this->month, 1)->format('M'),
            'value' => (int) $this->total_value,
            'year' => $this->year,
            'raw_month' => $this->month,
        ];
    }
}
