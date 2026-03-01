<?php
// app/Http/Resources/PlanResource.php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'pricing' => [
                'monthly' => (float) $this->price_monthly,
                'yearly' => (float) $this->price_yearly,
                'currency' => $this->currency,
            ],
            'limits' => [
                'max_membership' => (int) $this->max_membership,
                'max_staff' => (int) $this->max_staff,
                'max_branches' => (int) $this->max_branches,
            ],
            'features' => $this->features ? 
                (is_string($this->features) ? json_decode($this->features, true) : $this->features) 
                : [],
            'allow_multi_branch' => (bool) $this->allow_multi_branch,
            'allow_cross_branch_attendance' => (bool) $this->allow_cross_branch_attendance,
            'is_active' => (bool) $this->is_active,
            'is_public' => (bool) $this->is_public,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}