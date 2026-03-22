<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\BranchResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'sku'             => $this->sku,
            'category'        => $this->category,
            'description'     => $this->description,
            'color'           => $this->color,
            'sort_order'      => $this->sort_order,
            'branch_id'       => $this->branch_id,

            'selling_price'   => $this->selling_price,
            'cost_price'      => $this->cost_price,
            'currency'        => $this->currency,
            'margin'          => $this->margin,

            'stock'           => $this->stock,
            'min_stock'       => $this->min_stock,
            'unit'            => $this->unit,
            'stock_status'    => $this->stock_status,
            'is_low_stock'    => $this->isLowStock(),
            'is_out_of_stock' => $this->isOutOfStock(),

            'image'           => $this->image,
            'image_url'       => $this->image_url,

            'is_active'       => $this->is_active,
            'created_at'      => $this->created_at->toIso8601String(),

            'branch'          => new BranchResource($this->whenLoaded('branch')),
            'stock_movements' => StockMovementResource::collection($this->whenLoaded('stockMovements')),
        ];
    }
}