<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class StoreFacilityRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                => ['required', 'string', 'max:100'],
            'category'            => ['nullable', 'string', 'max:50'],
            'description'         => ['nullable', 'string'],
            'color'               => ['nullable', 'string', 'max:20'],
            'sort_order'          => ['nullable', 'integer', 'min:0'],

            'price'               => ['nullable', 'numeric', 'min:0'],
            'currency'            => ['nullable', 'string', 'size:3'],

            'minutes_per_session' => ['required', 'integer', 'min:1'],
            'capacity'            => ['nullable', 'integer', 'min:1'],
            'access_type'         => ['nullable', 'in:public,private'],

            'branch_id'           => ['nullable', 'uuid'],

            'operational_hours'   => ['nullable', 'array'],

            'always_available'    => ['nullable', 'boolean'],
            'available_from'      => ['nullable', 'date'],
            'available_until'     => ['nullable', 'date', 'after_or_equal:available_from'],

            'is_active'           => ['nullable', 'boolean'],
        ];
    }
}