<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClassPlanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                      => ['sometimes', 'string', 'max:100'],
            'category'                  => ['nullable', 'string', 'max:50'],
            'description'               => ['nullable', 'string'],
            'color'                     => ['nullable', 'string', 'max:20'],
            'sort_order'                => ['nullable', 'integer', 'min:0'],

            'price'                     => ['nullable', 'numeric', 'min:0'],
            'currency'                  => ['nullable', 'string', 'size:3'],

            'max_capacity'              => ['sometimes', 'integer', 'min:1'],
            'minutes_per_session'       => ['sometimes', 'integer', 'min:1'],

            'branch_id'                 => ['nullable', 'uuid'],
            'access_type'               => ['nullable', 'in:all_branches,single_branch'],

            'unlimited_monthly_session' => ['nullable', 'boolean'],
            'monthly_quota'             => ['nullable', 'integer', 'min:1'],
            'unlimited_daily_session'   => ['nullable', 'boolean'],
            'daily_quota'               => ['nullable', 'integer', 'min:1'],

            'always_available'          => ['nullable', 'boolean'],
            'available_from'            => ['nullable', 'date'],
            'available_until'           => ['nullable', 'date', 'after_or_equal:available_from'],

            'is_active'                 => ['nullable', 'boolean'],
        ];
    }
}