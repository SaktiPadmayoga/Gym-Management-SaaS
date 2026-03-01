<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DomainResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Query branch dari tenant DB jika branch_id ada
        $branch = null;
        if ($this->branch_id) {
            try {
                // Cari tenant DB connection name
                $tenant = $this->tenant ?? \App\Models\Tenant::find($this->tenant_id);
                if ($tenant) {
                    tenancy()->initialize($tenant);
                    $branch = \App\Models\Branch::find($this->branch_id);
                    tenancy()->end();
                }
            } catch (\Exception $e) {
                $branch = null;
            }
        }

        return [
            'id' => $this->id,
            'tenant_id' => $this->tenant_id,
            'branch_id' => $this->branch_id,
            'domain' => $this->domain,
            'type' => $this->type,
            'is_primary' => (bool) $this->is_primary,

            'tenant' => $this->whenLoaded('tenant', fn() => [
                'id' => $this->tenant->id,
                'name' => $this->tenant->name,
                'slug' => $this->tenant->slug,
            ]),

            'branch' => $branch ? [
                'id' => $branch->id,
                'name' => $branch->name,
                'branch_code' => $branch->branch_code,
            ] : null,

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
