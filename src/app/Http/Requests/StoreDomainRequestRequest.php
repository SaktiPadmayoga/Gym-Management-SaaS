<?php
// app/Http/Requests/StoreDomainRequestRequest.php

namespace App\Http\Requests;
use App\Models\Domain;
use App\Models\DomainRequest;
use Illuminate\Foundation\Http\FormRequest;

class StoreDomainRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
{
    return [
        'tenant_id' => 'required|uuid|exists:central.tenants,id',
        'branch_id' => 'nullable|uuid',
        'requested_domain' => [
            'required',
            'string',
            'max:255',
            'regex:/^[a-zA-Z0-9][a-zA-Z0-9\-\.]+[a-zA-Z0-9]$/',
            function ($attribute, $value, $fail) {
                if (Domain::where('domain', $value)->exists()) {
                    $fail('Domain already taken.');
                }
                if (DomainRequest::where('requested_domain', $value)->where('status', 'pending')->exists()) {
                    $fail('Domain already requested.');
                }
            },
        ],
    ];
}

    public function messages(): array
    {
        return [
            'requested_domain.regex' => 'Domain format is invalid.',
            'requested_domain.required' => 'Requested domain is required.',
        ];
    }
}