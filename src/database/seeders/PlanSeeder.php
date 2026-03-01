<?php

namespace Database\Seeders;

use App\Models\Plan;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PlanSeeder extends Seeder
{
    public function run(): void
    {
        // Trial Plan (default untuk new tenant)
        Plan::updateOrCreate(['code' => 'TRIAL'], [
            'id' => Str::uuid(),
            'name' => 'Trial',
            'code' => 'TRIAL',
            'description' => 'Free trial for 14 days with limited features.',
            'setup_fee' => 0.00,
            'price_monthly' => 0.00,
            'price_yearly' => 0.00,
            'currency' => 'IDR',
            'max_membership' => 50,  // Limit contoh untuk gym
            'max_staff' => 5,
            'max_branches' => 1,
            'features' => json_encode([
                'Basic gym management',
                'Member tracking (limited)',
                'Reporting',
            ]),
            'is_active' => true,
            'is_public' => false,  // Trial tidak ditampilkan di pricing page
        ]);

        // Basic Plan (contoh lain)
        Plan::updateOrCreate(['code' => 'BASIC'], [
            'id' => Str::uuid(),
            'name' => 'Basic',
            'code' => 'BASIC',
            'description' => 'Essential features for small gyms.',
            'setup_fee' => 800000.00,
            'price_monthly' => 800000.00,  // Dalam IDR
            'price_yearly' => 8000000.00,
            'currency' => 'IDR',
            'max_membership' => 100,
            'max_staff' => 2,
            'max_branches' => 0,
            'features' => json_encode([
                'All trial features',
                'Advanced reporting',
                'Email notifications',
            ]),
            'is_active' => true,
            'is_public' => true,
        ]);

        // Pro Plan (contoh)
        Plan::updateOrCreate(['code' => 'PREMIUM'], [
            'id' => Str::uuid(),
            'name' => 'Premium',
            'code' => 'PREMIUM',
            'description' => 'Unlimited features for large gyms.',
            'setup_fee' => 1300000.00,
            'price_monthly' => 1000000.00,
            'price_yearly' => 10000000.00,
            'currency' => 'IDR',
            'max_membership' => 0,  // Unlimited
            'max_staff' => 0,
            'max_branches' => 0,
            'features' => json_encode([
                'All basic features',
                'Custom branding',
                'API access',
                'Priority support',
            ]),
            'is_active' => true,
            'is_public' => true,
        ]);

        Plan::updateOrCreate(['code' => 'ENTERPRISE'], [
            'id' => Str::uuid(),
            'name' => 'Enterprise',
            'code' => 'ENTERPRISE',
            'description' => 'Unlimited features for large gyms.',
            'setup_fee' => 2000000.00,
            'price_monthly' => 2000000.00,
            'price_yearly' => 20000000.00,
            'currency' => 'IDR',
            'max_membership' => 0,  // Unlimited
            'max_staff' => 0,
            'max_branches' => 0,
            'features' => json_encode([
                'All basic features',
                'Custom branding',
                'API access',
                'Priority support',
            ]),
            'is_active' => true,
            'is_public' => true,
        ]);
    }
}