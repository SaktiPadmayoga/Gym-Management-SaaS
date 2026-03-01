<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Domain;

class BranchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Query domains dari central DB berdasarkan branch id
// Di BranchResource, ganti bagian domains:
$domains = $this->centralDomains ?? Domain::where('branch_id', $this->id)->get();

        return [
            'id' => $this->id,
            'branch_code' => $this->branch_code,
            'name' => $this->name,
            'address' => $this->address,
            'city' => $this->city,
            'phone' => $this->phone,
            'email' => $this->email,
            'timezone' => $this->timezone,
            'is_active' => (bool) $this->is_active,
            'opened_at' => $this->opened_at?->toISOString(),

            'domains' => $domains->map(fn($d) => [
                'id' => $d->id,
                'domain' => $d->domain,
                'type' => $d->type,
                'is_primary' => (bool) $d->is_primary,
            ]),

            // 'users' => $this->whenLoaded('users', function () {
            //     return $this->users->map(fn($user) => [
            //         'id' => $user->id,
            //         'name' => $user->name,
            //         'email' => $user->email,
            //         'role' => $user->pivot->role,
            //         'is_active' => $user->pivot->is_active,
            //     ]);
            // }),

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}