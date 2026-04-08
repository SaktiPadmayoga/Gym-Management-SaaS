<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $staffId = $this->route('staff');

        return [
            'name'      => ['sometimes', 'string', 'max:100'],
            'email'     => ['sometimes', 'email', "unique:staffs,email,{$staffId}"],
            'password'  => ['sometimes', Password::min(8)->mixedCase()->numbers()],
            'phone'     => ['nullable', 'string', 'max:20'],
            'avatar'    => ['nullable', 'image', 'max:2048'],
            'role'      => ['sometimes', 'in:owner,staff'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}