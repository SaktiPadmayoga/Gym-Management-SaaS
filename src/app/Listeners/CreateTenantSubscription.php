<?php

namespace App\Listeners;

use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Stancl\Tenancy\Events\TenantCreated;
use Illuminate\Support\Str;

class CreateTenantSubscription implements ShouldQueue
{
    use InteractsWithQueue;

    public function handle(TenantCreated $event): void
    {
        $tenant = $event->tenant;

        // Ambil trial plan berdasarkan CODE, bukan ID
        $trialPlan = Plan::where('code', 'TRIAL')->firstOrFail();

        // Buat subscription
        $subscription = Subscription::create([
            'id' => Str::uuid(), // jauh lebih aman daripada string manual
            'tenant_id' => $tenant->id,
            'plan_id' => $trialPlan->id,

            'status' => 'trial',
            'billing_cycle' => 'monthly',
            'amount' => 0.00,
            'auto_renew' => false,

            'started_at' => now(),
            'trial_ends_at' => now()->addDays(14),
            'current_period_ends_at' => now()->addDays(14),
        ]);

        // Sync ke tenant table
        $subscription->syncToTenant();
    }
}
