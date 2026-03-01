<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\Invoice;
use App\Models\Plan;
use App\Models\Tenant;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SubscriptionUpgradeService
{
    public function upgrade(Tenant $tenant, Plan $newPlan, string $billingCycle)
    {
        $currentSub = $this->getCurrentSubscription($tenant);
        
        if (!$currentSub) {
            throw new \Exception('No active or trial subscription');
        }

        $newAmount = $billingCycle === 'yearly' 
            ? $newPlan->price_yearly 
            : $newPlan->price_monthly;

        return DB::transaction(function () use ($tenant, $currentSub, $newPlan, $billingCycle, $newAmount) {
            // Create new subscription
            $newSub = $this->createNewSubscription($tenant, $newPlan, $billingCycle, $newAmount);

            // Cancel old subscription
            $this->cancelOldSubscription($currentSub);

            // Create invoice
            $invoice = $this->createInvoice($tenant, $newSub, $newPlan, $newAmount, $billingCycle);

            Log::info("Subscription upgraded for tenant {$tenant->id}: {$newSub->id}");

            return [
                'subscription' => $newSub,
                'invoice' => $invoice,
            ];
        });
    }

    private function getCurrentSubscription(Tenant $tenant): ?Subscription
    {
        return Subscription::where('tenant_id', $tenant->id)
            ->whereIn('status', ['active', 'trial'])
            ->latest('created_at')
            ->first();
    }

    private function createNewSubscription(Tenant $tenant, Plan $plan, string $billingCycle, $amount): Subscription
    {
        return Subscription::create([
            'id' => 'sub_' . Str::random(12),
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => $amount > 0 ? 'pending' : 'active',
            'billing_cycle' => $billingCycle,
            'amount' => $amount,
            'auto_renew' => true,
            'started_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
        ]);
    }

    private function cancelOldSubscription(Subscription $subscription): void
    {
        $subscription->update([
            'status' => 'cancelled',
            'canceled_at' => now(),
        ]);
    }

    private function createInvoice(Tenant $tenant, Subscription $subscription, Plan $plan, $amount, string $billingCycle): Invoice
    {
        return Invoice::create([
            'id' => 'inv_' . Str::random(10),
            'tenant_id' => $tenant->id,
            'subscription_id' => $subscription->id,
            'invoice_number' => Invoice::generateInvoiceNumber(),
            'amount' => $amount,
            'currency' => $plan->currency,
            'status' => 'draft',
            'issued_at' => now(),
            'due_at' => now()->addDays(7),
            'description' => "Upgrade plan ke {$plan->name} ({$billingCycle})",
            'items' => json_encode([
                ['item' => $plan->name, 'quantity' => 1, 'price' => $amount],
            ]),
        ]);
    }
}