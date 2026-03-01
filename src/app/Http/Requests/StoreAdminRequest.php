<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdminRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:150',
            'email' => 'required|email|unique:central.admins,email',
            'password' => 'required|min:6',
            'role' => 'required|in:super_admin,finance,support',
        ];
    }
}