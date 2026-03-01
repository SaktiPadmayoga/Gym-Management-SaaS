<?php

// app/Http/Requests/UpdateAccountRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:accounts,email,' . $this->account->id,
            'password' => 'nullable|min:8',
            'company_name' => 'nullable|string|max:150',
            'phone' => 'nullable|string|max:20',
            'status' => 'in:active,suspended'
        ];
    }
}
