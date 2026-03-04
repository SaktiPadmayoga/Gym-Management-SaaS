<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StaffResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'email'         => $this->email,
            'phone'         => $this->phone,
            'avatar'        => $this->avatar,
            'role'          => $this->role,
            'is_active'     => $this->is_active,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'created_at'    => $this->created_at->toIso8601String(),

            // Relasi branches — hanya muncul jika di-load
            'branches' => StaffBranchResource::collection($this->whenLoaded('staffBranches')),

            // Role di branch saat ini — hanya muncul jika ada konteks branch
            'current_branch_role' => $this->when(
                isset($this->current_branch_role),
                $this->current_branch_role
            ),
        ];
    }
}