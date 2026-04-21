<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class MemberRegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Endpoint publik — siapapun bisa registrasi
    }

    public function rules(): array
    {
        return [
            'plan_id'               => ['required', 'uuid', 'exists:membership_plans,id'],
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'email', 'unique:members,email'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
            'phone'                 => ['required', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'plan_id.exists'    => 'Paket membership tidak ditemukan.',
            'email.unique'      => 'Email sudah terdaftar. Silakan gunakan email lain.',
            'password.min'      => 'Password minimal 8 karakter.',
            'password.confirmed'=> 'Konfirmasi password tidak cocok.',
        ];
    }
}