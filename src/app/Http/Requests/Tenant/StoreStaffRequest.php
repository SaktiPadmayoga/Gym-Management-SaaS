<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:100'],
            'email'     => ['required', 'email', 'unique:staff,email'],
            'password'  => ['required', Password::min(8)->mixedCase()->numbers()],
            'phone'     => ['nullable', 'string', 'max:20'],
            'avatar'    => ['nullable', 'image', 'max:2048'],
            'role'      => ['nullable', 'in:owner,staff'],

            // Branch assignment saat create (opsional)
            'branch_id'    => ['nullable', 'uuid', 'exists:branches,id'],
            'branch_role'  => ['required_with:branch_id', 'in:branch_manager,trainer,receptionist,cashier'],
        ];
    }
}