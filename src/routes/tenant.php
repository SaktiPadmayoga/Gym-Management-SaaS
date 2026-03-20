<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\DomainRequestController;
use App\Http\Controllers\Tenant\StaffController;
use App\Http\Controllers\Tenant\BranchSettingController;
use App\Http\Controllers\Tenant\MemberController;
use App\Http\Controllers\Tenant\MembershipPlanController;
use App\Http\Controllers\Tenant\ClassPlanController;
use App\Http\Controllers\Tenant\PtSessionPlanController;
use App\Http\Controllers\Tenant\FacilityController;

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

// -----------------------------------------------
// Membership Plans
// -----------------------------------------------

Route::get('/membership-plans/categories',                         [MembershipPlanController::class, 'categories']);
Route::get('/membership-plans',                                    [MembershipPlanController::class, 'index']);
Route::post('/membership-plans',                                   [MembershipPlanController::class, 'store']);
Route::get('/membership-plans/{plan}',                             [MembershipPlanController::class, 'show']);
Route::put('/membership-plans/{plan}',                             [MembershipPlanController::class, 'update']);
Route::delete('/membership-plans/{plan}',                          [MembershipPlanController::class, 'destroy']);
Route::patch('/membership-plans/{plan}/toggle-active',             [MembershipPlanController::class, 'toggleActive']);
Route::post('/membership-plans/{plan}/duplicate',                  [MembershipPlanController::class, 'duplicate']);

// Class plan inclusions dalam membership plan
Route::get('/membership-plans/{plan}/class-plans',                 [MembershipPlanController::class, 'classPlans']);
Route::post('/membership-plans/{plan}/class-plans/sync',           [MembershipPlanController::class, 'syncClassPlans']);
Route::post('/membership-plans/{plan}/class-plans/attach',         [MembershipPlanController::class, 'attachClassPlan']);
Route::delete('/membership-plans/{plan}/class-plans/{classPlan}',  [MembershipPlanController::class, 'detachClassPlan']);

// -----------------------------------------------
// Class Plans
// -----------------------------------------------

Route::get('/class-plans/categories',                              [ClassPlanController::class, 'categories']);
Route::get('/class-plans',                                         [ClassPlanController::class, 'index']);
Route::post('/class-plans',                                        [ClassPlanController::class, 'store']);
Route::get('/class-plans/{plan}',                                  [ClassPlanController::class, 'show']);
Route::put('/class-plans/{plan}',                                  [ClassPlanController::class, 'update']);
Route::delete('/class-plans/{plan}',                               [ClassPlanController::class, 'destroy']);
Route::patch('/class-plans/{plan}/toggle-active',                  [ClassPlanController::class, 'toggleActive']);
Route::post('/class-plans/{plan}/duplicate',                       [ClassPlanController::class, 'duplicate']);

// Membership plans yang menginclude class plan ini
Route::get('/class-plans/{plan}/membership-plans',                 [ClassPlanController::class, 'membershipPlans']);


// -----------------------------------------------
// PT Session Plans
// -----------------------------------------------
Route::get('/pt-session-plans/categories',              [PtSessionPlanController::class, 'categories']);
Route::get('/pt-session-plans',                         [PtSessionPlanController::class, 'index']);
Route::post('/pt-session-plans',                        [PtSessionPlanController::class, 'store']);
Route::get('/pt-session-plans/{plan}',                  [PtSessionPlanController::class, 'show']);
Route::put('/pt-session-plans/{plan}',                  [PtSessionPlanController::class, 'update']);
Route::delete('/pt-session-plans/{plan}',               [PtSessionPlanController::class, 'destroy']);
Route::patch('/pt-session-plans/{plan}/toggle-active',  [PtSessionPlanController::class, 'toggleActive']);
Route::post('/pt-session-plans/{plan}/duplicate',       [PtSessionPlanController::class, 'duplicate']);


// -----------------------------------------------
// Facilities
// -----------------------------------------------
Route::get('/facilities/categories',              [FacilityController::class, 'categories']);
Route::get('/facilities',                         [FacilityController::class, 'index']);
Route::post('/facilities',                        [FacilityController::class, 'store']);
Route::get('/facilities/{facility}',              [FacilityController::class, 'show']);
Route::put('/facilities/{facility}',              [FacilityController::class, 'update']);
Route::delete('/facilities/{facility}',           [FacilityController::class, 'destroy']);
Route::patch('/facilities/{facility}/toggle-active', [FacilityController::class, 'toggleActive']);
 