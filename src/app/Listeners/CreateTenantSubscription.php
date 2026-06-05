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
        // Disable this listener to prevent duplicate subscription creation.
        // Tenant subscriptions are already created explicitly and synchronously in:
        // 1. TenantRegistrationService::registerTrial (for public signups)
        // 2. TenantService::create (for admin manual creation)
    }
}
