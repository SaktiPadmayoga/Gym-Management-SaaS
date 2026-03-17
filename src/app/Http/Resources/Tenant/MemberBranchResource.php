<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\BranchResource;


class MemberBranchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'branch_id'           => $this->branch_id,
            'status'              => $this->status,
            'plan_id'             => $this->plan_id,
            'member_code'         => $this->member_code,
            'is_primary'          => $this->is_primary,
            'started_at'          => $this->started_at?->toDateString(),
            'expires_at'          => $this->expires_at?->toDateString(),
            'frozen_at'           => $this->frozen_at?->toDateString(),
            'frozen_until'        => $this->frozen_until?->toDateString(),
            'freeze_days_used'    => $this->freeze_days_used,
            'days_until_expiry'   => $this->daysUntilExpiry(),
            'is_expired'          => $this->isExpired(),
            'notes'               => $this->notes,
            'joined_at'           => $this->joined_at?->toIso8601String(),
            'last_checkin_at'     => $this->last_checkin_at?->toIso8601String(),

            'branch'              => new BranchResource($this->whenLoaded('branch')),
        ];
    }
}