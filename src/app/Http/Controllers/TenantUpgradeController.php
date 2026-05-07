<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\CentralPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TenantUpgradeController extends Controller
{
    public function __construct(protected CentralPaymentService $paymentService)
    {}

    /**
     * POST /api/central/tenant/upgrade
     */
    public function upgrade(Request $request)
    {
        try {
            // Asumsi middleware tenancy sudah set context tenant yang sedang login
            $tenant = tenant(); 

            if (!$tenant) {
                return ApiResponse::error('Unauthorized. Tenant context not found.', null, 401);
            }

            $validated = $request->validate([
                'plan_id'       => 'required|uuid',
                'billing_cycle' => 'required|in:monthly,yearly',
            ]);

            // Ambil detail Plan dari Central DB
            $plan = DB::connection('central')->table('plans')
                ->where('id', $validated['plan_id'])
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->first();

            if (!$plan) {
                return ApiResponse::error('Plan tidak ditemukan atau tidak aktif.', null, 404);
            }

            // Ambil data kontak Owner dari Central DB
            $tenantData = DB::connection('central')->table('tenants')->where('id', $tenant->id)->first();
            
            $customerEmail = $tenantData->owner_email ?? ($tenant->slug . '@tenant.local');
            $customerName  = $tenantData->owner_name ?? $tenantData->name ?? $tenant->slug;
            $customerPhone = $tenantData->phone ?? '';

            // Cari langganan lama yang sedang berjalan untuk dibatalkan nanti
            $currentSub = DB::connection('central')->table('subscriptions')
                ->where('tenant_id', $tenant->id)
                ->whereIn('status', ['active', 'trial'])
                ->latest('created_at')
                ->first();

            // Panggil Service untuk buat Invoice, Payment, dan Token
            $paymentResult = $this->paymentService->createPaymentToken(
                $tenant, 
                $plan, 
                $validated['billing_cycle'], 
                [
                    'owner_name'  => $customerName,
                    'owner_email' => $customerEmail,
                    'phone'       => $customerPhone,
                ], 
                $currentSub ? $currentSub->id : null // Berikan ID langganan lama
            );

            return ApiResponse::success([
                'snap_token'     => $paymentResult['snap_token'],
                'order_id'       => $paymentResult['order_id'],
                'invoice_number' => $paymentResult['invoice_number'],
                'amount'         => $validated['billing_cycle'] === 'yearly' ? $plan->price_yearly : $plan->price_monthly,
                'client_key'     => config('midtrans.client_key'),
            ], 'Upgrade initiated successfully');

        } catch (\Exception $e) {
            Log::error('[TenantUpgrade] Error', [
                'tenant_id' => $tenant->id ?? 'unknown',
                'error'     => $e->getMessage()
            ]);
            
            return ApiResponse::error(
                'Gagal memulai proses upgrade.', 
                config('app.debug') ? $e->getMessage() : null, 
                500
            );
        }
    }
}