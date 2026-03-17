<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBranchSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'settings'              => ['required', 'array'],
            'settings.*.key'        => ['required', 'string'],
            'settings.*.value'      => ['nullable'],
            'settings.*.group'      => ['required', 'in:appearance,business,operational,membership,notification,security'],
            'settings.*.type'       => ['required', 'in:string,integer,boolean,json,color'],
            'settings.*.is_public'  => ['sometimes', 'boolean'],
        ];
    }
}