<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class StoreCheckInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Asumsikan middleware auth sanctum sudah menangani ini
    }

    public function rules(): array
    {
        return [
            'qr_token' => ['required', 'string'],
            'branch_id' => ['required', 'uuid', 'exists:branches,id'], // Dikirim oleh Frontend
        ];
    }
}