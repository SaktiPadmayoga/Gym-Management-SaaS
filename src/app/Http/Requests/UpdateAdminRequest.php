<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdminRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:150',
            'email' => 'sometimes|email|unique:central.admins,email,' . $this->route('admin'),
            'password' => 'sometimes|min:6',
            'role' => 'sometimes|in:super_admin,finance,support',
            'is_active' => 'sometimes|boolean',
        ];
    }
}