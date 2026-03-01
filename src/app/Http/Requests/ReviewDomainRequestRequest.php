<?php
// app/Http/Requests/ReviewDomainRequestRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReviewDomainRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'action' => 'required|in:approve,reject',
            'rejection_reason' => 'required_if:action,reject|nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'action.required' => 'Action is required.',
            'action.in' => 'Action must be approve or reject.',
            'rejection_reason.required_if' => 'Rejection reason is required when rejecting.',
        ];
    }
}