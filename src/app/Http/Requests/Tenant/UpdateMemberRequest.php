<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateMemberRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        $memberId = $this->route('member');

        return [
            'name'               => ['sometimes', 'string', 'max:100'],
            'email'              => ['sometimes', 'nullable', 'email', "unique:members,email,{$memberId}"],
            'phone'              => ['sometimes', 'nullable', 'string', 'max:20'],
            'emergency_contact'  => ['nullable', 'string', 'max:20'],
            'gender'             => ['sometimes', 'nullable', 'in:male,female'],
            'date_of_birth'      => ['sometimes', 'nullable', 'date', 'before:today'],
            'avatar'             => ['nullable', 'image', 'max:2048'],
            'address'            => ['nullable', 'string'],
            'id_card_number'     => ['nullable', 'string', 'max:30'],
            'password'           => ['nullable', Password::min(6)],
            'status'             => ['sometimes', 'in:active,inactive,expired,frozen,banned'],
            'is_active'          => ['sometimes', 'boolean'],
        ];
    }
}