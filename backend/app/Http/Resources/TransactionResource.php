<?php

namespace App\Http\Resources;

use App\Enums\TransactionType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
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
            'date' => $this->date->format('Y-m-d'),
            'amount' => (float) $this->amount,
            'category' => $this->category,
            'sub_category' => $this->sub_category,
            // Menangani baik Enum object (setelah cast) maupun string raw
            'type' => $this->type instanceof TransactionType ? $this->type->value : $this->type,
            'description' => $this->description,
            'note' => $this->note,
            'receipt_url' => $this->receipt_url,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
