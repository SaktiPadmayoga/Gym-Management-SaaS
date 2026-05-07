<?php

namespace App\Services;

use App\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TenantRegistrationService
{
    /**
     * Daftarkan akun Trial dan langsung setup Subscription Trial-nya.
     */
    public function registerTrial(array $data, object $trialPlan): array
    {
        $tenant = null;

        try {
                // 1. Buat database tenant
                $tenant = $this->provisionTenant($data, 'trial');

                // 2. Catat subscription di tabel sentral
                DB::connection('central')->table('subscriptions')->insert([
                    'id'                     => (string) Str::uuid(),
                    'tenant_id'              => $tenant->id,
                    'plan_id'                => $trialPlan->id,
                    'status'                 => 'trial',
                    'billing_cycle'          => 'monthly',
                    'amount'                 => 0,
                    'max_branches'           => 1,
                    'auto_renew'             => false,
                    'started_at'             => now(),
                    'current_period_ends_at' => now()->addDays(14),
                    'created_at'             => now(),
                    'updated_at'             => now(),
                ]);

                DB::connection('central')->table('notifications')->insert([
                    'id'         => (string) Str::uuid(),
                    'type'       => 'new_tenant',
                    'title'      => 'Gym Baru Berhasil Didaftarkan!',
                    'message'    => "Gym baru bernama '{$tenant->name}' berhasil didaftarkan!",
                    'is_read'    => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                return [
                    'tenant_domain' => $tenant->domains->first()->domain,
                    'slug'          => $tenant->slug,
                ];  
        } catch (\Exception $e) {
            $this->markAsFailed($tenant, $e->getMessage());
            throw $e;
        }
    }

    /**
     * Buat data Tenant, Domain, dan user pertama (Owner).
     */
    public function provisionTenant(array $data, string $finalStatus): Tenant
    {
        $slug = Str::slug($data['slug']);

        // Set status 'provisioning' sebelum DB setup selesai
        $tenant = Tenant::create([
            'id'                   => (string) Str::uuid(),
            'name'                 => $data['tenant_name'],
            'slug'                 => $slug,
            'owner_name'           => $data['owner_name'],
            'owner_email'          => $data['owner_email'],
            'status'               => 'provisioning',
            'timezone'             => $data['timezone'],
            'locale'               => 'id',
            'current_branch_count' => 1,
        ]);

        $tenant->domains()->create([
            'id'         => (string) Str::uuid(),
            'domain'     => "{$slug}.localhost",
            'type'       => 'tenant',
            'is_primary' => true,
        ]);

        // Setup isi database tenant
        $tenant->run(function () use ($data) {
            \App\Models\Branch::create([
                'id'          => (string) Str::uuid(),
                'branch_code' => 'MAIN',
                'name'        => $data['tenant_name'] . ' - Pusat',
                'city'        => $data['city'],
                'phone'       => $data['phone'] ?? null,
                'timezone'    => $data['timezone'],
                'is_active'   => true,
            ]);

            \App\Models\Tenant\Staff::create([
                'name'     => $data['owner_name'],
                'email'    => $data['owner_email'],
                'password' => Hash::make($data['password']),
                'phone'    => $data['phone'] ?? null,
                'role'     => 'owner',
            ]);
        });

        // Setup sukses, ubah status ke final (trial / suspended)
        $tenant->update(['status' => $finalStatus]);

        return $tenant->load('domains');
    }

    private function markAsFailed(?Tenant $tenant, string $error): void
    {
        if (!$tenant) return;
        try {
            $tenant->update(['status' => 'failed']);
            Log::error('[ProvisioningFailed] Tenant ID: ' . $tenant->id . ' - Error: ' . $error);
        } catch (\Exception $e) {
            Log::error('[MarkAsFailed_Error] ' . $e->getMessage());
        }
    }
}