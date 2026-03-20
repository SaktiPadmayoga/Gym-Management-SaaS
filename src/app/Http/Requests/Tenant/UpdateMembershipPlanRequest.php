<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMembershipPlanRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'                    => ['sometimes', 'string', 'max:100'],
            'category'                => ['sometimes', 'string', 'max:50'],
            'description'             => ['nullable', 'string'],
            'color'                   => ['nullable', 'string', 'max:20'],
            'sort_order'              => ['nullable', 'integer', 'min:0'],

            'price'                   => ['sometimes', 'numeric', 'min:0'],
            'currency'                => ['nullable', 'string', 'size:3'],
            'duration'                => ['sometimes', 'integer', 'min:1'],
            'duration_unit'           => ['sometimes', 'in:day,week,month,year'],

            'loyalty_points_reward'   => ['nullable', 'integer', 'min:0'],
            'max_sharing_members'     => ['nullable', 'integer', 'min:0'],

            'branch_id'               => ['nullable', 'uuid'],
            'access_type'             => ['nullable', 'in:all_branches,single_branch'],

            'unlimited_checkin'       => ['nullable', 'boolean'],
            'checkin_quota_per_month' => ['nullable', 'integer', 'min:1'],

            'unlimited_sold'          => ['nullable', 'boolean'],
            'total_quota'             => ['nullable', 'integer', 'min:1'],

            'always_available'        => ['nullable', 'boolean'],
            'available_from'          => ['nullable', 'date'],
            'available_until'         => ['nullable', 'date', 'after_or_equal:available_from'],

            'checkin_schedule'        => ['nullable', 'array'],
            'is_active'               => ['nullable', 'boolean'],
        ];
    }
}