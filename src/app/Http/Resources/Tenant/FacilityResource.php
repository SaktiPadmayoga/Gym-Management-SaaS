<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\BranchResource;

class FacilityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'name'                => $this->name,
            'category'            => $this->category,
            'description'         => $this->description,
            'color'               => $this->color,
            'sort_order'          => $this->sort_order,

            'price'               => $this->price,
            'currency'            => $this->currency,

            'minutes_per_session' => $this->minutes_per_session,
            'duration_label'      => $this->duration_label,
            'capacity'            => $this->capacity,
            'access_type'         => $this->access_type,

            'branch_id'           => $this->branch_id,

            'operational_hours'   => $this->operational_hours,

            'always_available'    => $this->always_available,
            'available_from'      => $this->available_from?->toDateString(),
            'available_until'     => $this->available_until?->toDateString(),
            'is_available'        => $this->isAvailable(),

            'is_active'           => $this->is_active,
            'created_at'          => $this->created_at->toIso8601String(),

            'branch'              => new BranchResource($this->whenLoaded('branch')),
        ];
    }
}