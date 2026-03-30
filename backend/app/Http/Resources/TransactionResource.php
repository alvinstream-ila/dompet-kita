<?php

namespace App\Http\Resources;

use Illuminate\Support\Facades\Storage;
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
        $receiptUrl = null;
        if ($this->receipt_url) {
            if (str_starts_with($this->receipt_url, 'http')) {
                $receiptUrl = $this->receipt_url;
            } else {
                try {
                    $receiptUrl = Storage::disk('storj')->temporaryUrl(
                        $this->receipt_url, 
                        now()->addMinutes(15)
                    );
                } catch (\Exception $e) {
                    $receiptUrl = Storage::disk('storj')->url($this->receipt_url);
                }
            }
        }

        return [
            'id' => $this->id,
            'date' => $this->date->format('Y-m-d'),
            'amount' => (float) $this->amount,
            'category' => $this->category,
            'sub_category' => $this->sub_category,
            'type' => $this->type instanceof TransactionType ? $this->type->value : $this->type,
            'description' => $this->description,
            'note' => $this->note,
            'receipt_url' => $receiptUrl,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
