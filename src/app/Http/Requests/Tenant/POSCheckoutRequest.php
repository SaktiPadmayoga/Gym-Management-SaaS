<?php

namespace App\Http\Requests\Tenant;

use Illuminate\Foundation\Http\FormRequest;

class POSCheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Sesuaikan dengan gate/policy nanti
    }

    public function rules(): array
    {
        return [
            'branch_id'        => ['required', 'uuid', 'exists:branches,id'],
            'member_id'        => ['nullable', 'uuid', 'exists:members,id'],

            // Guest fields — required jika member_id null
            'guest_name'       => ['required_without:member_id', 'nullable', 'string', 'max:100'],
            'guest_phone'      => ['required_without:member_id', 'nullable', 'string', 'max:20'],
            'guest_email'      => ['nullable', 'email'],

            'created_by'       => ['required', 'uuid', 'exists:staffs,id'],

            // Items
            'items'            => ['required', 'array', 'min:1'],
            'items.*.type'     => ['required', 'in:product,membership,pt_package'],
            'items.*.id'       => ['required', 'uuid'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],

            // Payment
            'payment_method'   => ['required', 'in:cash,card,digital_wallet,bank_transfer,mixed,midtrans'],
            'amount_paid'      => ['required', 'numeric', 'min:0'],
            'discount_amount'  => ['nullable', 'numeric', 'min:0'],
            'notes'            => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'guest_name.required_without'  => 'Guest name is required for walk-in customers.',
            'guest_phone.required_without' => 'Guest phone is required for walk-in customers.',
            'items.min'                    => 'Cart cannot be empty.',
        ];
    }
}