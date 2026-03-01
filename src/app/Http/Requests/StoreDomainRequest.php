<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDomainRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'tenant_id' => 'required|uuid|exists:tenants,id',
            'branch_id' => 'nullable|uuid|exists:tenant_branches,id',
            'domain' => 'required|string|max:255|unique:domains,domain',
            'type' => 'required|string|in:tenant,branch,custom',
            'is_primary' => 'boolean',
        ];
    }

    /**
     * Get custom error messages.
     */
    public function messages(): array
    {
        return [
            'tenant_id.required' => 'Tenant ID is required.',
            'tenant_id.exists' => 'The selected tenant does not exist.',
            'domain.required' => 'Domain is required.',
            'domain.unique' => 'This domain is already in use.',
            'type.required' => 'Domain type is required.',
            'type.in' => 'Domain type must be one of: tenant, branch, custom.',
        ];
    }
}
