<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\AssetType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateAssetRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'type' => ['sometimes', new Enum(AssetType::class)],
            'value' => ['sometimes', 'numeric', 'min:0', 'max:1000000000000'],
            'quantity' => ['sometimes', 'numeric', 'min:0'],
            'unit' => ['sometimes', 'nullable', 'string', 'max:50'],
            'is_market_synced' => ['sometimes', 'boolean'],
        ];
    }
}
