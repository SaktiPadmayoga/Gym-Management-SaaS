<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;

class TenantRegistrationController extends Controller
{
    public function __construct()
    {
        // Konfigurasi Midtrans
        Config::$serverKey    = config('midtrans.server_key');
        Config::$isProduction = config('midtrans.is_production');
        Config::$isSanitized  = config('midtrans.is_sanitized');
        Config::$is3ds        = config('midtrans.is_3ds');
    }

    /**
     * ========================================================================
     * 1. ALUR FREE TRIAL (Langsung Aktif tanpa Midtrans)
     * ========================================================================
     */
    public function registerTrial(Request $request)
    {
        $validated = $request->validate([
            'tenant_name' => 'required|string',
            'slug'        => 'required|string|unique:tenants,slug',
            'owner_name'  => 'required|string',
            'owner_email' => 'required|email|unique:tenants,owner_email',
            'password'    => 'required|min:8',
            'timezone'    => 'required|string',
            'city'        => 'required|string',
            'phone'       => 'nullable|string',
        ]);

        // ========================================================================
        // TAMBAHAN: Cari Plan dengan code 'TRIAL' sebelum membuat database tenant
        // ========================================================================
        $trialPlan = DB::connection('central')
            ->table('plans')
            ->where('code', 'TRIAL') // Pastikan code di database Anda adalah 'TRIAL'
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->first();

        // Jika Plan Trial tidak ditemukan di sistem, hentikan proses langsung (Fail Fast)
        if (!$trialPlan) {
            return ApiResponse::error('Paket Trial belum dikonfigurasi di sistem. Hubungi administrator.', null, 404);
        }

        $tenant = null;

        try {
            // 1. Eksekusi pembuatan Tenant (PostgreSQL Aman karena tanpa Transaction)
            $tenant = $this->provisionTenant($validated, 'trial');

            // 2. Transaksi KHUSUS untuk Central DB (Subscriptions dll)
            DB::beginTransaction();

            $subscriptionId = (string) Str::uuid();
            
            DB::connection('central')->table('subscriptions')->insert([
                'id'                     => $subscriptionId,
                'tenant_id'              => $tenant->id,
                'plan_id'                => $trialPlan->id,  // <-- MENGGUNAKAN ID DARI PLAN TRIAL
                'status'                 => 'trial',
                'billing_cycle'          => 'monthly',
                'amount'                 => 0,
                'max_branches'           => 1, // Atau ambil dari limit plan: json_decode($trialPlan->limits, true)['max_branches'] ?? 1
                'auto_renew'             => false,
                'started_at'             => now(),
                'current_period_ends_at' => now()->addDays(14), // Umur trial 14 hari
                'created_at'             => now(),
                'updated_at'             => now(),
            ]);

            DB::commit();

            return ApiResponse::success([
                'tenant_domain' => $tenant->domains->first()->domain,
                'slug'          => $tenant->slug
            ], 'Trial tenant created successfully', 201);

        } catch (\Exception $e) {
            // Rollback khusus tabel central
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }

            // MANUAL CLEANUP: Hapus tenant & database yang terlanjur dibuat
            if ($tenant) {
                try {
                    $tenant->delete();
                } catch (\Exception $cleanupError) {
                    Log::error('Cleanup Trial Tenant Failed: ' . $cleanupError->getMessage());
                }
            }

            Log::error('Register Trial Error: ' . $e->getMessage());
            return ApiResponse::error('Gagal membuat trial: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * ========================================================================
     * 2. ALUR PAID SUBSCRIPTION (Buat Tenant 'Suspended' & Midtrans Token)
     * ========================================================================
     */
    public function registerPaid(Request $request)
    {
        $validated = $request->validate([
            'tenant_name'   => 'required|string',
            'slug'          => 'required|string|unique:tenants,slug',
            'owner_name'    => 'required|string',
            'owner_email'   => 'required|email|unique:tenants,owner_email',
            'password'      => 'required|min:8',
            'timezone'      => 'required|string',
            'city'          => 'required|string',
            'phone'         => 'nullable|string',
            'plan_id'       => 'required|uuid',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $plan = DB::connection('central')->table('plans')->where('id', $validated['plan_id'])->first();
        if (!$plan) {
            return ApiResponse::error('Plan not found', null, 404);
        }

        $amount = $validated['billing_cycle'] === 'yearly' ? $plan->price_yearly : $plan->price_monthly;
        
        $tenant = null;

        try {
            // 1. Eksekusi pembuatan Tenant 
            // PostgreSQL AMAN: Tidak pakai DB::beginTransaction()
            $tenant = $this->provisionTenant($validated, 'suspended');

            // ==========================================================
            // SETELAH TENANT & DB SELESAI DIBUAT, BARU MULAI TRANSACTION
            // ==========================================================
            DB::beginTransaction();

            $invoiceNumber = 'INV-' . date('Y') . '-' . strtoupper(Str::random(8));
            $orderId       = 'ORD-' . strtoupper($tenant->slug) . '-' . time();
            $invoiceId     = (string) Str::uuid();

            // 2. Buat Invoice
            DB::connection('central')->table('invoices')->insert([
                'id'                 => $invoiceId,
                'tenant_id'          => $tenant->id,
                'subscription_id'    => null, 
                'invoice_number'     => $invoiceNumber,
                'external_reference' => $orderId,
                'amount'             => $amount,
                'currency'           => $plan->currency ?? 'IDR',
                'payment_gateway'    => 'midtrans',
                'status'             => 'pending',
                'issued_at'          => now(),
                'due_date'           => now()->addDay(),
                'notes' => json_encode([
                    'plan_id'       => $plan->id,
                    'plan_name'     => $plan->name,
                    'billing_cycle' => $validated['billing_cycle'],
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 3. Buat Payment Record
            DB::connection('central')->table('payments')->insert([
                'id'           => (string) Str::uuid(),
                'tenant_id'    => $tenant->id,
                'invoice_id'   => $invoiceId,
                'provider'     => 'midtrans',
                'order_id'     => $orderId,
                'gross_amount' => $amount,
                'status'       => 'pending',
                'created_at'   => now(),
                'updated_at'   => now(),
            ]);

            // 4. Minta Token ke Midtrans
            $snapToken = Snap::getSnapToken([
                'transaction_details' => [
                    'order_id'     => $orderId,
                    'gross_amount' => (int) $amount,
                ],
                'item_details' => [[
                    'id'       => $plan->id,
                    'price'    => (int) $amount,
                    'quantity' => 1,
                    'name'     => $plan->name . ' - ' . ucfirst($validated['billing_cycle']),
                ]],
                'customer_details' => [
                    'first_name' => $validated['owner_name'],
                    'email'      => $validated['owner_email'],
                    'phone'      => $validated['phone'] ?? '',
                ],
            ]);

            DB::commit();

            return ApiResponse::success([
                'snap_token'    => $snapToken,
                'order_id'      => $orderId,
                'tenant_domain' => $tenant->domains->first()->domain,
                'client_key'    => config('midtrans.client_key'),
            ], 'Payment initiated successfully');

        } catch (\Exception $e) {
            // 1. Rollback tabel central jika transaksi sempat dimulai
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }

            // 2. MANUAL CLEANUP: Hapus tenant yang terlanjur dibuat
            if ($tenant) {
                try {
                    $tenant->delete(); 
                } catch (\Exception $cleanupError) {
                    Log::error('Cleanup Tenant Failed: ' . $cleanupError->getMessage());
                }
            }

            Log::error('Register Paid Error: ' . $e->getMessage());
            
            // Output error asli sementara untuk memastikan jika ada bug lain
            return ApiResponse::error('Gagal registrasi: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * ========================================================================
     * PRIVATE HELPER: Logika Inti Provisioning Tenant
     * ========================================================================
     */
    private function provisionTenant(array $data, string $status)
    {
        $slug = Str::slug($data['slug']);
        $tenantId = (string) Str::uuid();

        // 1. Buat Tenant di Central
        $tenant = Tenant::create([
            'id'                   => $tenantId,
            'name'                 => $data['tenant_name'],
            'slug'                 => $slug,
            'owner_name'           => $data['owner_name'],
            'owner_email'          => $data['owner_email'],
            'status'               => $status, // 'trial' atau 'suspended'
            'timezone'             => $data['timezone'],
            'locale'               => 'id',
            'current_branch_count' => 1,
        ]);

        // 2. Buat Domain
        $domainStr = "{$slug}." . "localhost";
        $tenant->domains()->create([
            'id'         => (string) Str::uuid(),
            'domain'     => $domainStr,
            'type'       => 'tenant',
            'is_primary' => true,
        ]);

        // 3. Masuk ke DB Tenant (Package menangani perpindahan otomatis)
        $tenant->run(function () use ($data) {
            
            $branchId = (string) Str::uuid();
            $branch = \App\Models\Branch::create([
                'id'          => $branchId,
                'branch_code' => 'MAIN',
                'name'        => $data['tenant_name'] . ' - Pusat',
                'city'        => $data['city'],
                'phone'       => $data['phone'] ?? null,
                'timezone'    => $data['timezone'],
                'is_active'   => true,
            ]);

            $staff = \App\Models\Tenant\Staff::create([
                'name'     => $data['owner_name'],
                'email'    => $data['owner_email'],
                'password' => Hash::make($data['password']),
                'phone'    => $data['phone'] ?? null,
                'role'     => 'owner',
            ]);

        });

        return $tenant;
    }
}