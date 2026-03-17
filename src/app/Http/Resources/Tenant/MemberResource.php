<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'email'             => $this->email,
            'phone'             => $this->phone,
            'emergency_contact' => $this->emergency_contact,
            'gender'            => $this->gender,
            'date_of_birth'     => $this->date_of_birth?->toDateString(),
            'age'               => $this->getAge(),
            'avatar'            => $this->avatar,
            'address'           => $this->address,
            'id_card_number'    => $this->id_card_number,
            'status'            => $this->status,
            'is_active'         => $this->is_active,
            'member_since'      => $this->member_since?->toDateString(),
            'last_checkin_at'   => $this->last_checkin_at?->toIso8601String(),
            'last_login_at'     => $this->last_login_at?->toIso8601String(),
            'created_at'        => $this->created_at->toIso8601String(),

            // Relasi — hanya muncul jika di-load
            'branches'          => MemberBranchResource::collection($this->whenLoaded('memberBranches')),
            'primary_branch'    => new MemberBranchResource($this->whenLoaded('primaryBranch')),

            // Membership di branch saat ini — jika ada konteks branch
            'current_membership' => $this->when(
                isset($this->current_membership),
                fn() => new MemberBranchResource($this->current_membership)
            ),
        ];
    }
}