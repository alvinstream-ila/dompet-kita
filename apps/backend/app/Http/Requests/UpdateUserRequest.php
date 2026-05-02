<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Sanitize input to prevent XSS.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => $this->name ? strip_tags((string) $this->name) : null,
            'full_name' => $this->full_name ? strip_tags((string) $this->full_name) : null,
            'partner_name' => $this->partner_name ? strip_tags((string) $this->partner_name) : null,
            'industry_sector' => $this->industry_sector ? strip_tags((string) $this->industry_sector) : null,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();
        $userId = $user ? $user->getAuthIdentifier() : null;

        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('users', 'name')->ignore($userId),
            ],
            'full_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'avatar_url' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'partner_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'anniversary_date' => ['sometimes', 'nullable', 'date'],
            'timezone' => ['sometimes', 'string', 'max:100'],
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($userId),
            ],
            'budget_cycle_start' => ['sometimes', 'integer', 'min:1', 'max:31'],
            'is_privacy_mode' => ['sometimes', 'boolean'],
            'is_eco_mode' => ['sometimes', 'boolean'],
            'currency_format' => ['sometimes', 'string', 'max:10'],
            'exchange_rate' => ['sometimes', 'numeric', 'min:0'],
            'monthly_budget_limit' => ['sometimes', 'numeric', 'min:0'],
            'two_factor_enabled' => ['sometimes', 'boolean'],
            'large_expense_threshold' => ['sometimes', 'numeric', 'min:0'],
            'tax_status' => ['sometimes', 'string', 'max:10'],
            'dependents_count' => ['sometimes', 'integer', 'min:0', 'max:10'],
            'industry_sector' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
