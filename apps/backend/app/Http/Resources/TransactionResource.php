<?php

namespace App\Http\Resources;

use App\Enums\TransactionType;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

/**
 * @property int $id
 * @property Carbon $date
 * @property float $amount
 * @property string $category
 * @property string|null $sub_category
 * @property string|TransactionType $type
 * @property string $description
 * @property string|null $note
 * @property string|null $receipt_url
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * @property array<string, mixed>|null $metadata
 */
class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    #[\Override]
    public function toArray(Request $request): array
    {
        $receiptUrl = null;
        if ($this->receipt_url) {
            if (str_starts_with($this->receipt_url, 'http')) {
                $receiptUrl = $this->receipt_url;
            } else {
                $diskName = (string) (config('filesystems.disks.r2.key') ? 'r2' : config('filesystems.default', 'public'));
                try {
                    $receiptUrl = Storage::disk($diskName)->temporaryUrl(
                        $this->receipt_url,
                        now()->addMinutes(15)
                    );
                } catch (\Exception) {
                    // 🛡️ Security Fallback: Generate a signed URL to our own API
                    $receiptUrl = URL::temporarySignedRoute(
                        'media.serve',
                        now()->addMinutes(15),
                        ['path' => $this->receipt_url]
                    );
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
            'metadata' => $this->metadata,
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
        ];
    }
}
