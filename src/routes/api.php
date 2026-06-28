<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\DomainController;
use App\Http\Controllers\TenantUserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DomainRequestController;
use App\Http\Controllers\SubscriptionTenantController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TenantRegistrationController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\StaffAuthController;
use App\Http\Controllers\Auth\MemberAuthController;
use App\Http\Controllers\Tenant\MemberRegistrationController;
use App\Http\Controllers\Tenant\MidtransWebhookController;
use App\Http\Controllers\CentralDashboardController;
use App\Http\Controllers\CentralReportController;
use App\Http\Controllers\CentralNotificationController;

Route::get('/central/dashboard/summary', [CentralDashboardController::class, 'getSummary']);

Route::get('/central/reports', [CentralReportController::class, 'index']);
Route::get('/central/reports/export', [CentralReportController::class, 'export']);

Route::get('/central/notifications', [CentralNotificationController::class, 'index']);
Route::post('/central/notifications/{id}/read', [CentralNotificationController::class, 'markAsRead']);
Route::post('/central/notifications/mark-all-read', [CentralNotificationController::class, 'markAllAsRead']);

Route::prefix('tenant-auth')->group(function () {
    Route::get('/google/callback', [StaffAuthController::class, 'handleGoogleCallback']);
// Pintu Gerbang Utama untuk menerima kembalian dari Google
    Route::get('/member/google/callback', [MemberAuthController::class, 'handleGoogleCallback'])
        ->name('member.google.callback');
});
    
    
// Rute Webhook Midtrans khusus Tenant (Bypass CSRF & Auth)
Route::post('/payment/member-webhook', [MidtransWebhookController::class, 'handle']);

// Rute public untuk landing page SaaS
Route::get('/public-plans', [\App\Http\Controllers\PublicPlanController::class, 'index']);

Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('/register-trial', [TenantRegistrationController::class, 'registerTrial']);
    Route::post('/register-paid', [TenantRegistrationController::class, 'registerPaid']);
});

// -----------------------------------------------
// Admin Auth — tidak perlu middleware tenant
// -----------------------------------------------
 
Route::prefix('admin/auth')->group(function () {
    // Public
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/login',           [AdminAuthController::class, 'login']);
        Route::post('/forgot-password', [AdminAuthController::class, 'forgotPassword']);
        Route::post('/reset-password',  [AdminAuthController::class, 'resetPassword']);
    });
 
    // Protected
    Route::middleware('auth:admin')->group(function () {
        Route::post('/logout',          [AdminAuthController::class, 'logout']);
        Route::get('/me',               [AdminAuthController::class, 'me']);
        Route::post('/change-password', [AdminAuthController::class, 'changePassword']);
    });
});
 
// ============================================
// ADMIN ROUTES (Require Admin Auth)
// ============================================
Route::middleware('auth:admin')->group(function () {
    Route::prefix('admin')->group(function () {
        Route::apiResource('admins', AdminController::class);
    });

    Route::get('/central/dashboard/summary', [CentralDashboardController::class, 'getSummary']);
    Route::get('/central/reports', [CentralReportController::class, 'index']);
    Route::get('/central/reports/export', [CentralReportController::class, 'export']);

    Route::get('/central/notifications', [CentralNotificationController::class, 'index']);
    Route::post('/central/notifications/{id}/read', [CentralNotificationController::class, 'markAsRead']);
    Route::post('/central/notifications/mark-all-read', [CentralNotificationController::class, 'markAllAsRead']);

    Route::post('plans/{id}/restore', [PlanController::class, 'restore']);
    Route::delete('plans/{id}/force', [PlanController::class, 'forceDelete']);

    Route::prefix('tenants')->group(function () {
        Route::get('/', [TenantController::class, 'index']);
        Route::post('/', [TenantController::class, 'store']);
        Route::get('/{tenant}', [TenantController::class, 'show']);
        Route::put('/{tenant}', [TenantController::class, 'update']);
        Route::delete('/{tenant}', [TenantController::class, 'destroy']);
        Route::post('/{id}/restore', [TenantController::class, 'restore']);
    });

    Route::prefix('plans')->group(function () {
        Route::get('/', [PlanController::class, 'index']);
        Route::post('/', [PlanController::class, 'store']);
        Route::get('{id}', [PlanController::class, 'show']);
        Route::get('{id}/edit', [PlanController::class, 'edit']);
        Route::put('{id}', [PlanController::class, 'update']);
        Route::patch('{id}/cancel', [PlanController::class, 'cancel']);
        Route::delete('{id}', [PlanController::class,'destroy']);
    });

    Route::apiResource('tenant-users', TenantUserController::class);

    Route::prefix('subscriptions')->group(function () {
        Route::get('/', [SubscriptionController::class, 'index']);
        Route::get('{id}', [SubscriptionController::class, 'show']);
        Route::get('{id}/edit', [SubscriptionController::class, 'edit']);
        Route::put('{id}', [SubscriptionController::class, 'update']);
        Route::patch('{id}/cancel', [SubscriptionController::class, 'cancel']);
    });

    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'index']);
        Route::get('/{id}', [PaymentController::class, 'show']);
    });

    Route::prefix('invoices')->group(function () {
        Route::get('/', [PaymentController::class, 'indexInvoices']);
        Route::get('/{id}', [PaymentController::class, 'showInvoice']);
    });
});

// ============================================
// TENANT-SCOPED ROUTES (tenant database)
// ============================================
Route::middleware(['auth:staff', \App\Http\Middleware\InitializeTenancy::class, 'check_tenant_access'])->group(function () {
    Route::apiResource('branches', BranchController::class);
    Route::patch('branches/{branch}/toggle-active', [BranchController::class, 'toggleActive']);

    Route::get('/subscription/current', [SubscriptionTenantController::class, 'current']);
    Route::get('/subscription/history', [SubscriptionTenantController::class, 'history']);

    Route::post('/payment/token', [PaymentController::class, 'createToken']);
});

// ============================================
// DOMAIN ROUTES (SHARED ADMIN & STAFF)
// central database
// ============================================
Route::middleware('auth:admin,staff')->group(function () {
    Route::apiResource('domains', DomainController::class);
    Route::patch('domains/{domain}/toggle-primary', [DomainController::class, 'togglePrimary']);

    Route::prefix('domain-requests')->group(function () {
        Route::get('/', [DomainRequestController::class, 'index']);
        Route::get('/my', [DomainRequestController::class, 'myRequests']);
        Route::post('/', [DomainRequestController::class, 'store']);
        Route::get('/{id}', [DomainRequestController::class, 'show']);
        Route::post('/{id}/review', [DomainRequestController::class, 'review']);
        Route::delete('/{id}', [DomainRequestController::class, 'destroy']);
    });
});

// Webhook — tanpa middleware, Midtrans yang call ini
Route::post('/payment/webhook', [PaymentController::class, 'webhook']);
