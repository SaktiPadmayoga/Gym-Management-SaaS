<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\DomainRequestController;
use App\Http\Controllers\Tenant\StaffController;
use App\Http\Controllers\Tenant\BranchSettingController;
use App\Http\Controllers\Tenant\MemberController;

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


Route::get('/branches/{branch}/settings/public', [BranchSettingController::class, 'public']);
// Route::middleware(['auth:sanctum'])->group(function () {

   
// });
 // Ambil semua setting (bisa filter ?group=appearance)
    Route::get('/branches/{branch}/settings', [BranchSettingController::class, 'index']);

    // Update banyak setting sekaligus
    Route::put('/branches/{branch}/settings', [BranchSettingController::class, 'update']);

    // Update per group (lebih simpel untuk frontend per-tab)
    // PUT /branches/{id}/settings/appearance
    // PUT /branches/{id}/settings/operational
    // dst
    Route::put('/branches/{branch}/settings/{group}', [BranchSettingController::class, 'updateGroup']);

    // Reset group ke default
    Route::post('/branches/{branch}/settings/{group}/reset', [BranchSettingController::class, 'reset']);





// -----------------------------------------------
// CRUD Member
// -----------------------------------------------
Route::get('/members',            [MemberController::class, 'index']);
Route::post('/members',           [MemberController::class, 'store']);
Route::get('/members/{member}',   [MemberController::class, 'show']);
Route::put('/members/{member}',   [MemberController::class, 'update']);
Route::delete('/members/{member}',[MemberController::class, 'destroy']);

// -----------------------------------------------
// Branch Membership
// -----------------------------------------------

// Semua branch membership milik member ini
Route::get('/members/{member}/branches',                          [MemberController::class, 'branches']);

// Assign member ke branch baru
Route::post('/members/{member}/branches',                         [MemberController::class, 'assignBranch']);

// Update status membership (freeze, unfreeze, renew, cancel)
Route::patch('/members/{member}/branches/{branch}/membership',    [MemberController::class, 'updateMembership']);

// Cabut membership dari branch
Route::delete('/members/{member}/branches/{branch}',              [MemberController::class, 'revokeBranch']);