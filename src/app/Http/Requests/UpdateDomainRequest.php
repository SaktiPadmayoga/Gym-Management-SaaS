<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDomainRequest extends FormRequest
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
        $domainId = $this->route('domain');

        return [
            'branch_id' => 'nullable|uuid|exists:tenant_branches,id',
            'domain' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('domains', 'domain')->ignore($domainId),
            ],
            'type' => 'sometimes|string|in:tenant,branch,custom',
            'is_primary' => 'boolean',
        ];
    }
}
