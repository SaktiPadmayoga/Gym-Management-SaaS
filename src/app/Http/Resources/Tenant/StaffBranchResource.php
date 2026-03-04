<?php

namespace App\Http\Resources\Tenant;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\BranchResource;

class StaffBranchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'branch_id' => $this->branch_id,
            'role'      => $this->role,
            'is_active' => $this->is_active,
            'joined_at' => $this->joined_at?->toIso8601String(),

            // Relasi branch detail — hanya muncul jika di-load
            'branch' => new BranchResource($this->whenLoaded('branch')),
        ];
    }
}