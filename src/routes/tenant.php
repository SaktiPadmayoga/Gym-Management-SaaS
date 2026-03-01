<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\DomainRequestController;

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

