<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class StoreMemberRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name'               => ['required', 'string', 'max:100'],
            'email'              => ['nullable', 'email', 'unique:members,email'],
            'phone'              => ['nullable', 'string', 'max:20'],
            'emergency_contact'  => ['nullable', 'string', 'max:20'],
            'gender'             => ['nullable', 'in:male,female'],
            'date_of_birth'      => ['nullable', 'date', 'before:today'],
            'avatar'             => ['nullable', 'image', 'max:2048'],
            'address'            => ['nullable', 'string'],
            'id_card_number'     => ['nullable', 'string', 'max:30'],
            'qr_token'           => ['nullable', 'uuid', 'max:100'],
            'password'           => ['nullable', Password::min(6)],

            // Branch assignment saat create
            'home_branch_id' => ['nullable', 'uuid'],
            'plan_id'            => ['nullable', 'uuid'],
            'started_at'         => ['nullable', 'date'],
            'expires_at'         => ['nullable', 'date', 'after:started_at'],
            'member_code'        => ['nullable', 'string', 'max:50'],
            'is_primary'         => ['nullable', 'boolean'],
        ];
    }
}