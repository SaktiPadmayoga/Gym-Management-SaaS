<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Sesuaikan dengan policy/gate jika perlu
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'unique:users,email', 'max:255'],
            'password' => ['required', 'string', 'min:8'], // Password wajib saat create
            'role' => ['required', Rule::in(['owner', 'admin', 'trainer', 'receptionist', 'member'])],
            'isActive' => ['boolean'], // Menggunakan nama field camelCase dari input JSON
        ];
    }

    // Optional: Mapping input camelCase ke snake_case jika perlu, 
    // atau handle manual di controller.
    protected function prepareForValidation()
    {
        if ($this->has('isActive')) {
            $this->merge([
                'is_active' => $this->input('isActive'),
            ]);
        }
    }
}