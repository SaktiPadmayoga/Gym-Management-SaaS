<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\DomainRequestController;
use App\Http\Controllers\Tenant\StaffController;
use App\Http\Controllers\Tenant\BranchSettingController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\Tenant\MemberController;
use App\Http\Controllers\Tenant\MembershipPlanController;
use App\Http\Controllers\Tenant\ClassPlanController;
use App\Http\Controllers\Tenant\PtSessionPlanController;
use App\Http\Controllers\Tenant\FacilityController;
use App\Http\Controllers\Tenant\ProductController;
use App\Http\Controllers\Auth\MemberAuthController;
use App\Http\Controllers\Auth\StaffAuthController;
use App\Http\Controllers\SubscriptionTenantController;
use App\Http\Controllers\Tenant\CheckInController;
use App\Http\Controllers\Tenant\ClassScheduleController;
use App\Http\Controllers\Tenant\MemberClassController;
use App\Http\Controllers\Tenant\MemberRegistrationController;

Route::prefix('tenant-auth')->group(function () {
    Route::post('/login',          [StaffAuthController::class, 'login']);
    Route::get('/google',          [StaffAuthController::class, 'redirectToGoogle']);
});

// --- RUTE PUBLIC MEMBER ---
Route::post('/member/register', [MemberRegistrationController::class, 'register']);



// Prefix /api otomatis ditambahkan oleh konfigurasi RouteServiceProvider kamu
Route::prefix('member')->group(function () {
    
    // 1. AUTH ROUTES (Sudah berada di dalam konteks Tenant)
    Route::post('/auth/login', [MemberAuthController::class, 'login']);
    
    // Rute ini yang dipanggil tombol frontend Svelte untuk minta URL Google
    // Aman di sini karena Controller tinggal membaca request()->getHost()
    Route::get('/auth/google', [MemberAuthController::class, 'redirectToGoogle']);


    // 2. PROTECTED MEMBER ROUTES
    Route::middleware(['auth:member'])->group(function () {
        Route::get('/auth/me', [MemberAuthController::class, 'me']);
        Route::post('/auth/logout', [MemberAuthController::class, 'logout']);
        Route::post('/auth/change-password', [MemberAuthController::class, 'changePassword']);
    });
});

Route::prefix('member')->middleware('auth:member')->group(function () {
    Route::get('/class-schedules',              [MemberClassController::class, 'index']);
    Route::post('/class-schedules/{id}/book',   [MemberClassController::class, 'book']);
    Route::delete('/class-schedules/{id}/book', [MemberClassController::class, 'cancelBook']);
    Route::get('/my-classes',                   [MemberClassController::class, 'myClasses']);
});

Route::prefix('member')->group(function() {
    Route::get('/membershipAvailable', [MembershipPlanController::class, 'getAvailablePlans']);
});

Route::middleware(['auth:member'])->group(function () {
    Route::post('/check-ins', [CheckInController::class, 'store']);
});

Route::middleware('auth:staff')->group(function () {
    // ... route staff lainnya ...
    Route::post('/check-ins', [CheckInController::class, 'store']);
    Route::get('/check-ins', [CheckInController::class, 'index']);
});


// 3. PROTECTED STAFF ROUTES (Tetap di dalam routes/tenant.php)




// API Routes
Route::prefix('tenant')->group(function () {
    Route::get('/current', [TenantController::class, 'current']);
});

    Route::get('/branches/{branch}/settings/public', [BranchSettingController::class, 'public']);
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






Route::middleware('auth:staff')->group(function () {

    Route::prefix('class-schedules')->group(function () {
    Route::get('/',                                          [ClassScheduleController::class, 'index']);
    Route::post('/',                                         [ClassScheduleController::class, 'store']);
    Route::get('/{id}',                                      [ClassScheduleController::class, 'show']);
    Route::put('/{id}',                                      [ClassScheduleController::class, 'update']);
    Route::delete('/{id}',                                   [ClassScheduleController::class, 'destroy']);
    Route::patch('/{id}/cancel',                             [ClassScheduleController::class, 'cancel']);
    Route::get('/{id}/attendances',                          [ClassScheduleController::class, 'attendances']);
    Route::post('/{id}/attendances',                         [ClassScheduleController::class, 'addAttendance']);
    Route::patch('/{id}/attendances/{attendanceId}/checkin', [ClassScheduleController::class, 'markAttended']);
    Route::patch('/{id}/attendances/{attendanceId}/cancel',  [ClassScheduleController::class, 'cancelAttendance']);
});
    
    Route::apiResource('members', MemberController::class);
    Route::get('/memberships/active',  [MemberController::class, 'activeMemberships']);
Route::get('/memberships/history', [MemberController::class, 'membershipHistory']);
 
    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout',          [StaffAuthController::class, 'logout']);
        Route::get('/me',               [StaffAuthController::class, 'me']);
        Route::post('/change-password', [StaffAuthController::class, 'changePassword']);
    });
 
    
    Route::post('/upgrade', [PlanController::class, 'upgrade']);

    Route::get('/subscription/current', [SubscriptionTenantController::class,'current']);
    Route::get('/subscription/history', [SubscriptionTenantController::class,'history']);

    // tenant.php — tambahkan ini

    Route::apiResource('branches', BranchController::class);

    Route::apiResource('domain-requests', DomainRequestController::class);

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

    Route::get('members/{member}/memberships', [MemberController::class, 'memberships']);
    Route::post('members/{member}/memberships', [MemberController::class, 'assignMembership']);
    Route::patch('members/{member}/memberships/{membership}', [MemberController::class, 'updateMembership']);
    Route::delete('members/{member}/memberships/{membership}', [MemberController::class, 'cancelMembership']);

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
    
    // -----------------------------------------------
    // Products
    // -----------------------------------------------
    Route::get('/products/categories',                  [ProductController::class, 'categories']);
    Route::get('/products',                             [ProductController::class, 'index']);
    Route::post('/products',                            [ProductController::class, 'store']);
    Route::get('/products/{product}',                   [ProductController::class, 'show']);
    Route::put('/products/{product}',                   [ProductController::class, 'update']);
    Route::delete('/products/{product}',                [ProductController::class, 'destroy']);
    Route::patch('/products/{product}/toggle-active',   [ProductController::class, 'toggleActive']);
    
    // Stock Management
    Route::post('/products/{product}/stock/add',        [ProductController::class, 'addStock']);
    Route::post('/products/{product}/stock/adjust',     [ProductController::class, 'adjustStock']);
    Route::get('/products/{product}/stock/history',     [ProductController::class, 'stockHistory']);
    

});