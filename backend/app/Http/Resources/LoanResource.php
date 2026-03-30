<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoanResource extends JsonResource
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
            'debtor' => $this->debtor,
            'amount' => (float) $this->amount,
            'remaining_amount' => (float) $this->remaining_amount,
            'due_date' => $this->due_date?->toDateString(),
            'status' => $this->status,
            'type' => $this->type,
            'note' => $this->note,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
