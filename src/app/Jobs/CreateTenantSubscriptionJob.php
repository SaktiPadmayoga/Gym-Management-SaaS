<?php

namespace App\Jobs;

use App\Models\Plan;
use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Stancl\Tenancy\Database\Models\Tenant;

class CreateTenantSubscriptionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Tenant $tenant;

    /**
     * Create a new job instance.
     */
    public function __construct(Tenant $tenant)
    {
        $this->tenant = $tenant;
    }

    /**
     * Execute the job.
     */
   public function handle(): void
{
    Log::info("Starting CreateTenantSubscriptionJob for tenant: {$this->tenant->id}");

    try {
        $trialPlan = Plan::where('code', 'TRIAL')->orWhere('id', 'trial')->firstOrFail();        
        Log::info("Trial plan found: {$trialPlan->id} - {$trialPlan->name}");

        $subscription = Subscription::create([
            'id'                    => 'sub_' . $this->tenant->id . '_' . now()->timestamp,
            'tenant_id'             => $this->tenant->id,
            'plan_id'               => $trialPlan->id,
            'status'                => 'trial',
            'billing_cycle'         => 'monthly',
            'amount'                => 0.00,
            'auto_renew'            => false,
            'started_at'            => now(),
            'trial_ends_at'         => now()->addDays(14),
            'current_period_ends_at' => now()->addDays(14),
        ]);

        Log::info("Subscription created: {$subscription->id} for tenant {$this->tenant->id}");

        $subscription->syncToTenant();
        Log::info("Dates synced to tenant {$this->tenant->id}");
    } catch (\Exception $e) {
        Log::error("Error in CreateTenantSubscriptionJob for tenant {$this->tenant->id}: " . $e->getMessage());
        Log::error($e->getTraceAsString());
        throw $e; // Biar job ditandai failed di queue table
    }
    DB::commit();
}

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        // Optional: Log error atau kirim notifikasi
        Log::error("Failed to create trial subscription for tenant {$this->tenant->id}: " . $exception->getMessage());
    }
    
}