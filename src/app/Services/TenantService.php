<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Subscription;
use App\Models\Plan;

class TenantService
{
    public static function create(array $validated): Tenant
    {
        return DB::transaction(function () use ($validated) {

            $slug = Str::slug($validated['slug']);

            // =====================
            // CREATE TENANT (CENTRAL)
            // =====================
            $tenant = Tenant::create([
                'id' => (string) Str::uuid(),
                'name' => $validated['name'],
                'slug' => $slug,
                'owner_name' => $validated['owner_name'],
                'owner_email' => $validated['owner_email'],
                'status' => $validated['status'],
                'logo_url' => $validated['logo_url'] ?? null,
                'timezone' => $validated['timezone'],
                'locale' => $validated['locale'],
                'max_branches' => $validated['max_branches'] ?? 0,
                'current_branch_count' => 1,
                'trial_ends_at' => $validated['trial_ends_at'] ?? now()->addDays(7),
                'subscription_ends_at' => $validated['subscription_ends_at'] ?? now()->addDays(14),
            ]);

            // =====================
            // DOMAIN
            // =====================
            $tenant->domains()->create([
                'id' => (string) Str::uuid(),
                'domain' => "{$slug}.localhost",
                'type' => 'tenant',
                'is_primary' => true,
            ]);

            self::createTrialSubscription($tenant);

            // =====================
            // TENANT DB OPERATIONS
            // =====================
            $tenant->run(function () use ($tenant, $validated) {

                // 🔥 STAFF OWNER
                \App\Models\Tenant\Staff::create([
                    'name'     => $validated['owner_name'],
                    'email'    => $validated['owner_email'],
                    'password' => Hash::make($validated['password']),
                    'phone'    => $validated['phone'] ?? null,
                    'role'     => 'owner',
                ]);

                // 🔥 BRANCH
                $branch = $validated['branch'];

                \App\Models\Branch::create([
                    'id' => (string) Str::uuid(),
                    'branch_code' => $branch['branch_code'],
                    'name' => $branch['name'],
                    'address' => $branch['address'] ?? null,
                    'city' => $branch['city'] ?? null,
                    'phone' => $branch['phone'] ?? null,
                    'email' => $branch['email'] ?? null,
                    'timezone' => $branch['timezone'] ?? $tenant->timezone,
                    'is_active' => true,
                    'opened_at' => $branch['opened_at'] ?? now(),
                ]);
            });

            return $tenant->load('domains');
        });
    }
    private static function createTrialSubscription(Tenant $tenant): void
    {
        $trialPlan = Plan::where('code', 'TRIAL')
            ->orWhere('id', 'trial')
            ->firstOrFail();

        Subscription::create([
            'id' => (string) Str::uuid(),
            'tenant_id' => $tenant->id,
            'plan_id' => $trialPlan->id,
            'status' => 'trial',
            'billing_cycle' => 'monthly',
            'amount' => 0,
            'auto_renew' => false,
            'started_at' => now(),
            'trial_ends_at' => now()->addDays(14),
            'current_period_ends_at' => now()->addDays(14),
        ]);
    }
}