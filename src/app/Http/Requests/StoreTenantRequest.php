<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // TENANT
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tenants,slug',
            'owner_name' => 'required|string|max:255',
            'owner_email' => 'required|email|max:255',

            'status' => 'required|in:trial,active,suspended,expired',
            'logo_url' => 'nullable|url|max:500',
            'timezone' => 'required|string|max:100',
            'locale' => 'required|string|max:10',

            'trial_ends_at' => 'nullable|date',
            'subscription_ends_at' => 'nullable|date',

            // BRANCH (nested)
            'branch.branch_code' => 'required|string|max:50',
            'branch.name' => 'required|string|max:255',
            'branch.address' => 'nullable|string|max:500',
            'branch.city' => 'nullable|string|max:255',
            'branch.phone' => 'nullable|string|max:20',
            'branch.email' => 'nullable|email|max:255',
            'branch.timezone' => 'nullable|string|max:100',
            'branch.opened_at' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tenant name is required',
            'slug.unique' => 'Slug already exists',
            'owner_name.required' => 'Owner name is required',
            'owner_email.required' => 'Owner email is required',
            'owner_email.email' => 'Owner email must be valid',

            'branch.branch_code.required' => 'Branch code is required',
            'branch.name.required' => 'Branch name is required',
        ];
    }
}
