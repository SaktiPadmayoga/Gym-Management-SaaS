<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Adjust if auth needed
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'code' => 'required|string|unique:plans,code|max:50',
            'description' => 'nullable|string|max:1000',
            'price_monthly' => ['required', 'integer', 'min:0'],
            'price_yearly'  => ['required', 'integer', 'min:0'],
            'currency' => 'nullable|string|size:3',
            'max_membership' => 'nullable|integer|min:0',
            'max_staff' => 'nullable|integer|min:0',
            'max_branches' => 'nullable|integer|min:0',
            'allow_multi_branch' => 'nullable|boolean',
            'allow_cross_branch_attendance' => 'nullable|boolean',
            'features' => 'nullable|array',
            'features.*' => 'string|max:255',
            'is_active' => 'nullable|boolean',
            'is_public' => 'nullable|boolean',
        ];
    }
}