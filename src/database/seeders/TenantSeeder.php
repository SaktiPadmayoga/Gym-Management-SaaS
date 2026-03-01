<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;

class TenantSeeder extends Seeder
{
    public function run(): void
{
    $trialPlan = Plan::where('code', 'TRIAL')->firstOrFail();

    Tenant::updateOrCreate(
        ['id' => Str::uuid()],
        [
            'data' => [
                'tenant_name' => 'Gym Abadi',
                'slug' => 'gym-abadi',
                'business_name' => 'PT Gym Abadi',
                'logo_url' => null,
                'email' => 'admin@gymabadi.com',
                'phone' => '08123456789',
                'status' => 'trial',
                'plan_id' => $trialPlan->id,
                'timezone' => 'Asia/Jakarta',
                'currency' => 'IDR',
                'locale' => 'id',
                'address' => 'Jakarta Selatan',
            ],
            'trial_ends_at' => now()->addDays(14),
            'subscription_ends_at' => null,
        ]
    );
}

}
