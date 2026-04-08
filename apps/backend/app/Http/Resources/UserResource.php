<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @OA\Schema(
 *     schema="UserResource",
 *     title="User Resource",
 *
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Alvin"),
 *     @OA\Property(property="email", type="string", example="alvin@example.com"),
 *     @OA\Property(property="full_name", type="string", nullable=true, example="Muhammad Alvin"),
 *     @OA\Property(property="partner_name", type="string", nullable=true, example="Ila"),
 *     @OA\Property(property="anniversary_date", type="string", format="date", nullable=true),
 *     @OA\Property(property="is_privacy_mode", type="boolean", example=false),
 *     @OA\Property(property="monthly_budget_limit", type="number", example=5000000),
 *     @OA\Property(property="currency_format", type="string", example="IDR")
 * )
 */
/**
 * @mixin \App\Models\User
 */
class UserResource extends JsonResource
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
            'email' => $this->email,
            'full_name' => $this->full_name,
            'avatar_url' => $this->avatar_url,
            'partner_name' => $this->partner_name,
            'anniversary_date' => $this->anniversary_date,
            'timezone' => $this->timezone ?? 'Asia/Jakarta',
            'budget_cycle_start' => $this->budget_cycle_start,
            'is_privacy_mode' => (bool) $this->is_privacy_mode,
            'is_eco_mode' => (bool) $this->is_eco_mode,
            'currency_format' => $this->currency_format,
            'exchange_rate' => (float) $this->exchange_rate,
            'monthly_budget_limit' => (float) $this->monthly_budget_limit,
            'is_social_login' => (bool) $this->social_id,
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
