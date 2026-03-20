<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\BranchResource;


class PtSessionPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'name'                  => $this->name,
            'category'              => $this->category,
            'description'           => $this->description,
            'color'                 => $this->color,
            'sort_order'            => $this->sort_order,

            'price'                 => $this->price,
            'currency'              => $this->currency,
            'duration'              => $this->duration,
            'duration_unit'         => $this->duration_unit,
            'duration_label'        => $this->duration . ' ' . $this->duration_unit . ($this->duration > 1 ? 's' : ''),

            'minutes_per_session'   => $this->minutes_per_session,
            'total_sessions'        => $this->total_sessions,
            'loyalty_points_reward' => $this->loyalty_points_reward,

            'branch_id'             => $this->branch_id,

            'unlimited_sold'        => $this->unlimited_sold,
            'total_quota'           => $this->total_quota,
            'sold_count'            => $this->sold_count,
            'remaining_quota'       => $this->remaining_quota,
            'has_stock'             => $this->hasStock(),

            'always_available'      => $this->always_available,
            'available_from'        => $this->available_from?->toDateString(),
            'available_until'       => $this->available_until?->toDateString(),
            'is_available'          => $this->isAvailable(),

            'is_active'             => $this->is_active,
            'created_at'            => $this->created_at->toIso8601String(),

            'branch'                => new BranchResource($this->whenLoaded('branch')),
        ];
    }
}