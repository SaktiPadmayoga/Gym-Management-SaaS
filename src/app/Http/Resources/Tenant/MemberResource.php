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
            'date_of_birth'     => $this->date_of_birth?->format('Y-m-d'),
            
            // Perhatikan ini: variabelnya bernama avatar_url
            'avatar_url'        => $this->avatar ? asset('storage/' . $this->avatar) : null,
            
            'address'           => $this->address,
            'id_card_number'    => $this->id_card_number,
            'qr_token'          => $this->qr_token,
            'status'            => $this->status,
            'is_active'         => $this->is_active,
            'member_since'      => $this->member_since?->format('Y-m-d'),
            'last_checkin_at'   => $this->last_checkin_at?->toIso8601String(),
            'last_login_at'     => $this->last_login_at?->toIso8601String(),
            'created_at'        => $this->created_at->toIso8601String(),

            // Load Relasi Home Branch
            'home_branch'       => $this->whenLoaded('branch', function () {
                return [
                    'id'   => $this->branch->id,
                    'name' => $this->branch->name,
                ];
            }),

            // ✅ PERBAIKAN: Gunakan `new MembershipResource` karena ini hasOne (objek tunggal), bukan collection
            'active_membership' => $this->whenLoaded('activeMembership', function () {
                return new MembershipResource($this->activeMembership);
            }),
        ];
    }
}