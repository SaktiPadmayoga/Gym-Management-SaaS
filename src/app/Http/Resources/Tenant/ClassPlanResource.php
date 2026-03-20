<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\BranchResource;


class ClassPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                        => $this->id,
            'name'                      => $this->name,
            'category'                  => $this->category,
            'description'               => $this->description,
            'color'                     => $this->color,
            'sort_order'                => $this->sort_order,

            'price'                     => $this->price,
            'currency'                  => $this->currency,

            'max_capacity'              => $this->max_capacity,
            'minutes_per_session'       => $this->minutes_per_session,
            'duration_label'            => $this->duration_label,

            'branch_id'                 => $this->branch_id,
            'access_type'               => $this->access_type,

            'unlimited_monthly_session' => $this->unlimited_monthly_session,
            'monthly_quota'             => $this->monthly_quota,
            'unlimited_daily_session'   => $this->unlimited_daily_session,
            'daily_quota'               => $this->daily_quota,

            'always_available'          => $this->always_available,
            'available_from'            => $this->available_from?->toDateString(),
            'available_until'           => $this->available_until?->toDateString(),
            'is_available'              => $this->isAvailable(),

            'is_active'                 => $this->is_active,
            'created_at'                => $this->created_at->toIso8601String(),

            // Pivot data — muncul saat diakses via membership plan relation
            'pivot' => $this->when(isset($this->pivot), [
                'unlimited_session'       => $this->pivot?->unlimited_session,
                'monthly_quota_override'  => $this->pivot?->monthly_quota_override,
                'daily_quota_override'    => $this->pivot?->daily_quota_override,
            ]),

            'branch'           => new BranchResource($this->whenLoaded('branch')),
            'membership_plans' => MembershipPlanResource::collection($this->whenLoaded('membershipPlans')),
        ];
    }
}