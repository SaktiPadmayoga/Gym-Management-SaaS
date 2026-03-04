<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\DomainRequestController;
use App\Http\Controllers\Tenant\StaffController;

// Health check
Route::get('/health', function () {
    $tenant = tenant();
    return response()->json([
        'status' => 'ok',
        'tenant_id' => $tenant?->id,
    ]);
});

// Welcome
Route::get('/', function () {
    $tenant = tenant();
    return response()->json([
        'message' => 'Welcome to ' . ($tenant->data['name'] ?? 'Tenant'),
        'tenant_id' => $tenant->id,
        'current_plan' => $tenant->activeSubscription?->plan?->name ?? 'No plan',
    ]);
});

// API Routes
Route::prefix('tenant')->group(function () {
    Route::get('/current', [TenantController::class, 'current']);
});

Route::post('/upgrade', [PlanController::class, 'upgrade']);

// tenant.php — tambahkan ini



// CRUD Staff
Route::get('/staff',                                  [StaffController::class, 'index']);
Route::post('/staff',                                 [StaffController::class, 'store']);
Route::get('/staff/{staff}',                          [StaffController::class, 'show']);
Route::put('/staff/{staff}',                          [StaffController::class, 'update']);
Route::delete('/staff/{staff}',                       [StaffController::class, 'destroy']);

// Branch Assignment
Route::get('/staff/{staff}/branches',                 [StaffController::class, 'branches']);
Route::post('/staff/{staff}/branches',                [StaffController::class, 'assignBranch']);
Route::delete('/staff/{staff}/branches/{branch}',     [StaffController::class, 'revokeBranch']);