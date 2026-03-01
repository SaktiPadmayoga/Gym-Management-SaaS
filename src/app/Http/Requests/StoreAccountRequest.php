<?php

// app/Http/Requests/StoreAccountRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:100',
            'email' => 'required|email|unique:accounts,email',
            'password' => 'required|min:8',
            'company_name' => 'nullable|string|max:150',
            'phone' => 'nullable|string|max:20'
        ];
    }
}
