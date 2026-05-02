<?php

declare(strict_types=1);

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
    #[\Override]
    public function toArray(Request $request): array
    {
        // Check if $this->resource is an array
        if (is_array($this->resource)) {
            /** @var array<string, mixed> $res */
            $res = $this->resource;

            return $res;
        }

        $date = Carbon::create((int) $this->year, (int) $this->month, 1);

        return [
            'month' => $date instanceof Carbon ? $date->format('M') : 'N/A',
            'value' => (float) $this->total_value,
            'year' => (int) $this->year,
            'raw_month' => (int) $this->month,
        ];
    }
}
