<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // $this->user adalah instance model dari route binding
        $userId = $this->user->id; 

        return [
            'email' => ['required', 'email', Rule::unique('users')->ignore($userId), 'max:255'],
            'password' => ['nullable', 'string', 'min:8'], // Password optional saat update
            'role' => ['required', Rule::in(['owner', 'admin', 'trainer', 'receptionist', 'member'])],
            'isActive' => ['boolean'],
        ];
    }

    protected function prepareForValidation()
    {
        if ($this->has('isActive')) {
            $this->merge([
                'is_active' => $this->input('isActive'),
            ]);
        }
    }
}