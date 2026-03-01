<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $tenantId = $this->route('tenant')?->id;

        return [
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
            
        ];
    }
}
