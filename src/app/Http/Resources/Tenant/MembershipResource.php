<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembershipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                      => $this->id,
            'member_id'               => $this->member_id,
            'membership_plan_id'      => $this->membership_plan_id,
            'branch_id'          => $this->branch_id,
            'start_date'              => $this->start_date?->format('Y-m-d'),
            'end_date'                => $this->end_date?->format('Y-m-d'),
            'status'                  => $this->status,
            'unlimited_checkin'       => $this->unlimited_checkin,
            'remaining_checkin_quota' => $this->remaining_checkin_quota,
            'total_checkins'          => $this->total_checkins,
            'frozen_until'            => $this->frozen_until?->format('Y-m-d'),
            'notes'                   => $this->notes,
            
            // Load relasi plan agar frontend tahu nama paketnya
            'plan' => $this->whenLoaded('plan', function () {
                return [
                    'id'   => $this->plan->id,
                    'name' => $this->plan->name,
                ];
            }),
        ];
    }
}