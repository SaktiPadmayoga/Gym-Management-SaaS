<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'role' => $this->role,
            'isActive' => (bool) $this->is_active,
            'emailVerifiedAt' => $this->email_verified_at,
            
            // Relationships (Loaded conditionally)
            // Mengembalikan null jika relation tidak di-load di controller
            'memberProfile' => $this->whenLoaded('memberProfile'), 
            'staff' => $this->whenLoaded('staff'),

            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}