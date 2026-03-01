<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use Illuminate\Console\Command;

class CheckSubscriptions extends Command
{
    protected $signature = 'subscriptions:check';
    protected $description = 'Check and update expired subscriptions';

    public function handle(): void
    {
        Subscription::where('status', '!=', 'expired')
            ->where('current_period_ends_at', '<', now())
            ->each(function ($subscription) {
                $subscription->update(['status' => 'expired']);
                $subscription->syncToTenant();
                // Optional: Kirim email expired
            });

        $this->info('Subscriptions checked successfully.');
    }
}