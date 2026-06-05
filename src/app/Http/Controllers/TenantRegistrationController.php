<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\TenantRegistrationService;
use App\Services\CentralPaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TenantRegistrationController extends Controller
{
    public function __construct(
        protected TenantRegistrationService $registrationService,
        protected CentralPaymentService $paymentService
    ) {}

    // =========================================================
    // REGISTER TRIAL
    // =========================================================
    public function registerTrial(Request $request)
    {
        $validated = $request->validate([
            'tenant_name' => 'required|string',
            'slug'        => 'required|string|unique:tenants,slug',
            'owner_name'  => 'required|string',
            'owner_email' => 'required|email',
            'password'    => 'required|min:8',
            'timezone'    => 'required|string',
            'city'        => 'required|string',
            'phone'       => 'nullable|string',
        ]);

        $trialPlan = DB::connection('central')->table('plans')
            ->where('code', 'TRIAL')
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->first();

        if (!$trialPlan) {
            return ApiResponse::error('Paket Trial belum dikonfigurasi.', null, 404);
        }

        try {
            $result = $this->registrationService->registerTrial($validated, $trialPlan);

            return ApiResponse::success([
                'tenant_domain' => $result['tenant_domain'],
                'slug'          => $result['slug'],
            ], 'Trial tenant created successfully', null, 201);

        } catch (\Exception $e) {
            Log::error('[RegisterTrial] ' . $e->getMessage());
            return ApiResponse::error('Gagal membuat trial: ' . $e->getMessage(), null, 500);
        }
    }

    // =========================================================
    // REGISTER PAID
    // =========================================================
    public function registerPaid(Request $request)
    {
        $validated = $request->validate([
            'tenant_name'   => 'required|string',
            'slug'          => 'required|string|unique:tenants,slug',
            'owner_name'    => 'required|string',
            'owner_email'   => 'required|email',
            'password'      => 'required|min:8',
            'timezone'      => 'required|string',
            'city'          => 'required|string',
            'phone'         => 'nullable|string',
            'plan_id'       => 'required|uuid',
            'billing_cycle' => 'required|in:monthly,yearly',
        ]);

        $plan = DB::connection('central')->table('plans')
            ->where('id', $validated['plan_id'])
            ->first();

        if (!$plan) {
            return ApiResponse::error('Plan not found', null, 404);
        }

        try {
            // 1. Buat Tenant dengan status 'suspended'
            $tenant = $this->registrationService->provisionTenant($validated, 'suspended');

            // Kirim email sukses & panduan awal ke owner (dengan status suspended awaiting payment)
            $this->registrationService->sendWelcomeMail($tenant, $validated, $plan->name ?? 'Paid Plan', 'suspended');

            // 2. Serahkan tagihan ke Payment Service
            $paymentResult = $this->paymentService->createPaymentToken($tenant, $plan, $validated['billing_cycle'], [
                'owner_name' => $validated['owner_name'],
                'owner_email' => $validated['owner_email'],
            ], null);

            return ApiResponse::success([
                'snap_token'    => $paymentResult['snap_token'],
                'order_id'      => $paymentResult['order_id'],
                'tenant_domain' => $tenant->domains->first()->domain,
                'client_key'    => config('midtrans.client_key'),
            ], 'Payment initiated successfully');

        } catch (\Exception $e) {
            Log::error('[RegisterPaid] ' . $e->getMessage());
            return ApiResponse::error('Gagal registrasi: ' . $e->getMessage(), null, 500);
        }
    }
}