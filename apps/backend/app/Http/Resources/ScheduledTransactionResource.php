<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ScheduledTransactionResource extends JsonResource
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
            'description' => $this->description,
            'amount' => (float) $this->amount,
            'type' => $this->type,
            'category' => $this->category,
            'recurrence' => $this->recurrence,
            'next_due_date' => $this->next_due_date->format('Y-m-d'),
            'status' => $this->status,
            'is_auto_execute' => $this->is_auto_execute,
            'last_executed_at' => $this->last_executed_at?->toDateTimeString(),
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
