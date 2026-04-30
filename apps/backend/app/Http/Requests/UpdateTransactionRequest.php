<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\TransactionType;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTransactionRequest extends FormRequest
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
            'date' => ['sometimes', 'date'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'category' => ['sometimes', 'string', 'max:100'],
            'sub_category' => ['nullable', 'string', 'max:100'],
            'type' => ['sometimes', Rule::enum(TransactionType::class)],
            'description' => ['sometimes', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:1000'],
            'receipt_url' => ['nullable', 'string', 'max:2048'],
        ];
    }
}
