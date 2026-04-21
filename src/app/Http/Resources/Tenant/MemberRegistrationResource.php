<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read array $resource  {member, invoice, snap_token}
 */
class MemberRegistrationResource extends JsonResource
{
    /**
     * $this->resource adalah array hasil dari MemberRegistrationService::register()
     */
    public function toArray(Request $request): array
    {
        $member  = $this->resource['member'];
        $invoice = $this->resource['invoice'];

        return [
            'member' => [
                'id'    => $member->id,
                'name'  => $member->name,
                'email' => $member->email,
                'phone' => $member->phone,
            ],
            'invoice' => [
                'id'             => $invoice->id,
                'invoice_number' => $invoice->invoice_number,
                'total_amount'   => $invoice->total_amount,
                'currency'       => $invoice->currency,
                'due_date'       => $invoice->due_date?->toIso8601String(),
                'status'         => $invoice->status,
                'items'          => $invoice->items->map(fn ($item) => [
                    'item_name'  => $item->item_name,
                    'quantity'   => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price'=> $item->total_price,
                ]),
            ],
            'snap_token' => $this->resource['snap_token'],
            'gateway'    => 'midtrans',
        ];
    }
}