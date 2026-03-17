<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class AssignBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['nullable', 'uuid'],
            'role'       => ['required', 'in:branch_manager,trainer,receptionist,cashier'],
            'joined_at'  => ['nullable', 'date'],
        ];
    }
}