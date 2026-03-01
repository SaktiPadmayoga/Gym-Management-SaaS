<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubscriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tenantId' => $this->tenant_id,
            'tenantName' => $this->tenant?->name,      
            'planId' => $this->plan_id,
            'planName' => $this->plan?->name,           
            'status' => $this->status,
            'billingCycle' => $this->billing_cycle,
            'amount' => (float) $this->amount,
            'autoRenew' => $this->auto_renew,
            'startedAt' => $this->started_at,
            'trialEndsAt' => $this->trial_ends_at,
            'currentPeriodEndsAt' => $this->current_period_ends_at,
            'canceledAt' => $this->canceled_at,
            'lastInvoiceId' => $this->last_invoice_id,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
        ];
    }
}
