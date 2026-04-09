<?php

namespace App\Http\Requests\AI;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AnalyzeReceiptRequest extends FormRequest
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
            'image' => 'nullable|string|max:15000000', // ~10-11MB Base64 limit
            'mime_type' => 'nullable|string|max:100',
            'receipt_url' => 'nullable|url',
            'receipt_path' => 'nullable|string',
        ];
    }
}
