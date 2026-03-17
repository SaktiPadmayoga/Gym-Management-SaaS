<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class AssignMemberBranchRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'branch_id' => ['nullable', 'uuid'],
            'plan_id'     => ['nullable', 'uuid'],
            'started_at'  => ['nullable', 'date'],
            'expires_at'  => ['nullable', 'date', 'after:started_at'],
            'member_code' => ['nullable', 'string', 'max:50'],
            'is_primary'  => ['nullable', 'boolean'],
            'notes'       => ['nullable', 'string'],
        ];
    }
}