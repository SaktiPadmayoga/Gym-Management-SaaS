<?php

namespace App\Jobs;

use App\Models\Subscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UpgradeSubscriptionJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Subscription $subscription;

    public function __construct(Subscription $subscription)
    {
        $this->subscription = $subscription;
    }

    public function handle(): void
    {
        try {
            // Finalisasi: Sync dates ke tenant
            $this->subscription->syncToTenant();

            // Kirim notif/email (contoh, tambah real logic nanti)
            Log::info("Upgrade completed for subscription {$this->subscription->id}. Email sent to tenant.");

            // Jika payment nanti: Cek status invoice, update subscription jika paid
        } catch (\Exception $e) {
            Log::error("Error in UpgradeSubscriptionJob for subscription {$this->subscription->id}: " . $e->getMessage());
            throw $e;
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("Failed to upgrade subscription {$this->subscription->id}: " . $exception->getMessage());
    }
}