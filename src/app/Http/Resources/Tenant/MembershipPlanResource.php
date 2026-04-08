<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'branch_id'               => $this->branch_id,
            'name'                    => $this->name,
            'category'                => $this->category,
            'description'             => $this->description,
            'color'                   => $this->color,
            'price'                   => (float) $this->price,
            'duration'                => $this->duration,
            'duration_unit'           => $this->duration_unit,
            'loyalty_points_reward'   => $this->loyalty_points_reward,
            'max_sharing_members'     => $this->max_sharing_members,
            
            // Kolom baru kita
            'access_type'             => $this->access_type,
            'approval_status'         => $this->approval_status,
            
            'unlimited_checkin'       => (bool) $this->unlimited_checkin,
            'checkin_quota_per_month' => $this->checkin_quota_per_month,
            
            'unlimited_sold'          => (bool) $this->unlimited_sold,
            'total_quota'             => $this->total_quota,
            
            'always_available'        => (bool) $this->always_available,
            'available_from'          => $this->available_from,
            'available_until'         => $this->available_until,
            
            'is_active'               => (bool) $this->is_active,
            'checkin_schedule'        => $this->checkin_schedule,
            
            'created_at'              => $this->created_at?->toIso8601String(),
            'updated_at'              => $this->updated_at?->toIso8601String(),

            // Load Relasi jika ada (misalnya class_plans)
            // 'class_plans' => ClassPlanResource::collection($this->whenLoaded('classPlans')),
            
            // Pengganti hasStock() jika frontend membutuhkannya:
            'is_available_to_sell'    => $this->unlimited_sold || ($this->total_quota > 0),
        ];
    }
}