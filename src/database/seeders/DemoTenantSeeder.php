<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DemoTenantSeeder extends Seeder
{
    public function run(): void
    {
        $tenantId = Str::uuid();

        // =========================
        // TENANT
        // =========================
        DB::table('tenants')->insert([
            'id' => $tenantId,
            'name' => 'Gym Sehat Indonesia',
            'slug' => 'gym-sehat',
            'owner_name' => 'Budi Santoso',
            'owner_email' => 'owner@gymsehat.com',
            'status' => 'active',
            'max_branches' => 5,
            'current_branch_count' => 2,
            'timezone' => 'Asia/Jakarta',
            'locale' => 'id',
            'trial_ends_at' => Carbon::now()->addDays(14),
            'subscription_ends_at' => Carbon::now()->addMonth(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // =========================
        // DOMAINS
        // =========================
        DB::table('domains')->insert([
            [
                'id' => Str::uuid(),
                'domain' => 'gymsehat.test',
                'tenant_id' => $tenantId,
                'branch_id' => null,
                'type' => 'tenant',
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'domain' => 'cabang1.gymsehat.test',
                'tenant_id' => $tenantId,
                'branch_id' => null,
                'type' => 'branch',
                'is_primary' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'domain' => 'cabang2.gymsehat.test',
                'tenant_id' => $tenantId,
                'branch_id' => null,
                'type' => 'branch',
                'is_primary' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // =========================
        // PLAN
        // =========================
        $planId = Str::uuid();

        DB::table('plans')->insert([
            'id' => $planId,
            'name' => 'Business Plan',
            'code' => 'BUSINESS',
            'description' => 'Paket multi cabang untuk gym',
            'price_monthly' => 500000,
            'price_yearly' => 5000000,
            'currency' => 'IDR',
            'max_membership' => 1000,
            'max_staff' => 50,
            'max_branches' => 5,
            'allow_multi_branch' => true,
            'allow_cross_branch_attendance' => true,
            'is_active' => true,
            'is_public' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // =========================
        // SUBSCRIPTION
        // =========================
        $subscriptionId = Str::uuid();

        DB::table('subscriptions')->insert([
            'id' => $subscriptionId,
            'tenant_id' => $tenantId,
            'plan_id' => $planId,
            'status' => 'active',
            'billing_cycle' => 'monthly',
            'amount' => 500000,
            'auto_renew' => true,
            'max_branches' => 5,
            'max_users' => 50,
            'started_at' => now(),
            'current_period_ends_at' => now()->addMonth(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // =========================
        // TENANT USER (OWNER)
        // =========================
        $tenantUserId = Str::uuid();

        DB::table('tenant_users')->insert([
            'id' => $tenantUserId,
            'tenant_id' => $tenantId,
            'name' => 'Budi Santoso',
            'email' => 'owner@gymsehat.com',
            'password' => bcrypt('password'),
            'role' => 'owner',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // =========================
        // BRANCHES
        // =========================
        $branch1Id = Str::uuid();
        $branch2Id = Str::uuid();

        DB::table('tenant_branches')->insert([
            [
                'id' => $branch1Id,
                'tenant_id' => $tenantId,
                'branch_code' => 'JKT-01',
                'name' => 'Gym Sehat Jakarta',
                'address' => 'Jl. Sudirman No. 1',
                'city' => 'Jakarta',
                'phone' => '081234567890',
                'email' => 'jakarta@gymsehat.com',
                'timezone' => 'Asia/Jakarta',
                'is_active' => true,
                'opened_at' => now()->subMonths(3),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $branch2Id,
                'tenant_id' => $tenantId,
                'branch_code' => 'BDG-01',
                'name' => 'Gym Sehat Bandung',
                'address' => 'Jl. Dago No. 10',
                'city' => 'Bandung',
                'phone' => '081222222222',
                'email' => 'bandung@gymsehat.com',
                'timezone' => 'Asia/Jakarta',
                'is_active' => true,
                'opened_at' => now()->subMonth(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // =========================
        // PIVOT USER - BRANCH
        // =========================
        DB::table('tenant_user_branches')->insert([
            [
                'id' => Str::uuid(),
                'tenant_user_id' => $tenantUserId,
                'branch_id' => $branch1Id,
                'role' => 'branch_manager',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'tenant_user_id' => $tenantUserId,
                'branch_id' => $branch2Id,
                'role' => 'branch_manager',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        // =========================
        // TENANT DATABASE
        // =========================
        DB::table('tenant_databases')->insert([
            'id' => Str::uuid(),
            'tenant_id' => $tenantId,
            'db_host' => '127.0.0.1',
            'db_port' => '3306',
            'db_name' => 'tenant_gym_sehat',
            'db_username' => 'tenant_user',
            'db_password' => encrypt('secret123'),
            'status' => 'active',
            'last_checked_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // =========================
        // TENANT SETTINGS
        // =========================
        DB::table('tenant_settings')->insert([
            [
                'id' => Str::uuid(),
                'tenant_id' => $tenantId,
                'key' => 'attendance_mode',
                'value' => 'cross_branch',
                'type' => 'string',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'tenant_id' => $tenantId,
                'key' => 'currency',
                'value' => 'IDR',
                'type' => 'string',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
