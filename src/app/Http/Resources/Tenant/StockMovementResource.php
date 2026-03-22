<?php
namespace App\Http\Resources\Tenant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'type'           => $this->type,
            'qty_before'     => $this->qty_before,
            'qty_change'     => $this->qty_change,
            'qty_after'      => $this->qty_after,
            'is_incoming'    => $this->isIncoming(),
            'notes'          => $this->notes,
            'reference_id'   => $this->reference_id,
            'reference_type' => $this->reference_type,
            'created_at'     => $this->created_at?->toIso8601String(),
        ];
    }
}