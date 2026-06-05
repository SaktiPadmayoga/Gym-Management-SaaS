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
                $subscriptionId = (string) Str::uuid();
                DB::connection('central')->table('subscriptions')->insert([
                    'id'                     => $subscriptionId,
                    'tenant_id'              => $tenant->id,
                    'plan_id'                => $trialPlan->id,
                    'status'                 => 'trial',
                    'billing_cycle'          => 'monthly',
                    'amount'                 => 0,
                    'max_branches'           => 1,
                    'auto_renew'             => false,
                    'started_at'             => now(),
                    'trial_ends_at'          => now()->addDays(14),
                    'current_period_ends_at' => now()->addDays(14),
                    'created_at'             => now(),
                    'updated_at'             => now(),
                ]);

                // Sync tanggal trial ke tabel tenants
                $subscription = \App\Models\Subscription::find($subscriptionId);
                if ($subscription) {
                    $subscription->syncToTenant();
                }

                DB::connection('central')->table('notifications')->insert([
                    'id'         => (string) Str::uuid(),
                    'type'       => 'new_tenant',
                    'title'      => 'Gym Baru Berhasil Didaftarkan!',
                    'message'    => "Gym baru bernama '{$tenant->name}' berhasil didaftarkan!",
                    'is_read'    => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Kirim email sukses & konfigurasi awal ke owner
                $this->sendWelcomeMail($tenant, $data, $trialPlan->name ?? 'Trial Plan', 'trial');

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

        // Dapatkan base domain dari env, jika tidak ada ekstrak dari APP_URL (gymfit.id / localhost)
        $appUrlHost = parse_url(config('app.url'), PHP_URL_HOST);
        $baseDomain = env('TENANT_BASE_DOMAIN') ?: ($appUrlHost ?: 'localhost');

        $tenant->domains()->create([
            'id'         => (string) Str::uuid(),
            'domain'     => $slug . '.' . $baseDomain,
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

    /**
     * Kirim email selamat datang dan panduan setup awal ke email owner.
     */
    public function sendWelcomeMail(Tenant $tenant, array $data, string $planName, string $status): void
    {
        try {
            $slug = $tenant->slug;
            $protocol = str_contains(config('app.url'), 'https://') ? 'https://' : 'http://';
            
            $appUrlHost = parse_url(config('app.url'), PHP_URL_HOST);
            $baseDomain = env('TENANT_BASE_DOMAIN') ?: ($appUrlHost ?: 'localhost');
            
            $loginUrl = $protocol . $slug . '.' . $baseDomain . '/tenant-auth/login';

            \Illuminate\Support\Facades\Mail::to($data['owner_email'])->send(new \App\Mail\OwnerWelcomeMail(
                $tenant,
                $data['owner_name'],
                $data['owner_email'],
                $loginUrl,
                $planName,
                $status
            ));
        } catch (\Exception $e) {
            Log::error('[MailError] Gagal mengirim email selamat datang ke owner ' . $data['owner_email'] . ': ' . $e->getMessage());
        }
    }
}