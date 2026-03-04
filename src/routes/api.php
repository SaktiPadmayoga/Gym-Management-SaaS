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
use App\Http\Controllers\Tenant\StaffController;


    
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

Route::prefix('admin')->group(function () {
    Route::apiResource('admins' , AdminController::class);
});

// Route::apiResource('admins', AdminController::class);

// ============================================
// TENANT-SCOPED ROUTES (tenant database)
// Middleware InitializeTenancy resolve tenant dari X-Tenant header
// ============================================
// ✅ Pastikan domain-requests ada di dalam middleware InitializeTenancy
Route::middleware([\App\Http\Middleware\InitializeTenancy::class])->group(function () {
    Route::apiResource('branches', BranchController::class);
    Route::patch('branches/{branch}/toggle-active', [BranchController::class, 'toggleActive']);

    Route::apiResource('domains', DomainController::class);

    // ✅ Pindahkan domain-requests ke sini
    Route::prefix('domain-requests')->group(function () {
        Route::get('/my', [DomainRequestController::class, 'myRequests']);
        Route::post('/', [DomainRequestController::class, 'store']);
        Route::delete('/{id}', [DomainRequestController::class, 'destroy']);
    });

     Route::get('/subscription/current', [SubscriptionTenantController::class, 'current']);
    Route::get('/subscription/history', [SubscriptionTenantController::class, 'history']);

    Route::post('/payment/token', [PaymentController::class, 'createToken']);
});

// ============================================
// DOMAIN ROUTES (central database)
// Bisa diakses dari central maupun tenant
// Filter tenant_id otomatis dari X-Tenant header jika ada
// ============================================
Route::apiResource('domains', DomainController::class);
Route::patch('domains/{domain}/toggle-primary', [DomainController::class, 'togglePrimary']);

Route::prefix('domain-requests')->group(function () {
    Route::get('/', [DomainRequestController::class, 'index']);
    Route::get('/{id}', [DomainRequestController::class, 'show']);
    Route::post('/{id}/review', [DomainRequestController::class, 'review']);
});



// Webhook — tanpa middleware, Midtrans yang call ini
Route::post('/payment/webhook', [PaymentController::class, 'webhook']);

// Central routes (admin)
Route::prefix('payments')->group(function () {
    Route::get('/', [PaymentController::class, 'index']);
    Route::get('/{id}', [PaymentController::class, 'show']);
});

Route::prefix('invoices')->group(function () {
    Route::get('/', [PaymentController::class, 'indexInvoices']);
    Route::get('/{id}', [PaymentController::class, 'showInvoice']);
});