<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CheckInResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'checked_in_at' => $this->checked_in_at->format('Y-m-d H:i:s'),
            'status' => $this->status,
            'notes' => $this->notes,
            'member' => [
                'id' => $this->member->id,
                'name' => $this->member->name,
                'avatar' => $this->member->avatar,
            ],
            'membership' => $this->membership ? [
                'plan_name' => $this->membership->plan->name ?? 'Unknown',
                'end_date' => $this->membership->end_date ? $this->membership->end_date->format('Y-m-d') : null,
                'is_unlimited' => $this->membership->unlimited_checkin,
                'remaining_quota' => $this->membership->remaining_checkin_quota,
            ] : null,
        ];
    }
}