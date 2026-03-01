<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'owner_name' => $this->owner_name,
            'owner_email' => $this->owner_email,
            'logo_url' => $this->logo_url,

            'status' => $this->status,
            'timezone' => $this->timezone,
            'locale' => $this->locale,

            'trial_ends_at' => $this->trial_ends_at,
            'subscription_ends_at' => $this->subscription_ends_at,

            'max_branches' => $this->max_branches,
            'current_branch_count' => $this->current_branch_count,

            'domains' => $this->whenLoaded('domains', function () {
                return $this->domains->map(fn ($domain) => [
                    'id' => $domain->id,
                    'domain' => $domain->domain,
                    'type' => $domain->type,
                    'is_primary' => $domain->is_primary,
                    'phone' => $domain->phone ?? null,
                ]);
            }),

            'latestSubscription' => $this->whenLoaded('latestSubscription', function () {
                return [
                    'id' => $this->latestSubscription->id,
                    'status' => $this->latestSubscription->status,
                    'plan' => [
                        'id' => $this->latestSubscription->plan->id ?? null,
                        'name' => $this->latestSubscription->plan->name ?? null,
                    ],
                ];
            }),

            // CATATAN: branches sekarang di tenant database
            // Akses via: $tenant->run(fn() => Branch::all())
            // current_branch_count sudah tersedia di atas

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
