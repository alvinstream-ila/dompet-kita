<?php

namespace App\Http\Resources;

use App\Models\Loan;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property int $id
 * @property string $contact_name
 * @property float $amount
 * @property float $remaining_amount
 * @property Carbon|null $due_date
 * @property string $status
 * @property string $type
 * @property string|null $description
 * @property Carbon $created_at
 */
/**
 * @mixin Loan
 * @method __construct(\App\Models\Loan $resource)
 */
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
            'contact_name' => $this->contact_name,
            'amount' => (float) $this->amount,
            'remaining_amount' => (float) $this->remaining_amount,
            'due_date' => $this->due_date?->toDateString(),
            'status' => $this->status,
            'type' => $this->type,
            'description' => $this->description,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
