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
use App\Http\Controllers\Tenant\MemberClassBookingController;
use App\Http\Controllers\Tenant\MemberPtController;
use App\Http\Controllers\Tenant\PtSessionController;
use App\Http\Controllers\Tenant\PtPackageController;
use App\Http\Controllers\Tenant\POSController;
use App\Http\Controllers\Tenant\FacilityBookingController;
use App\Http\Controllers\Tenant\MemberMembershipController;
use App\Http\Controllers\Tenant\TenantDashboardController;
use App\Http\Controllers\Tenant\TenantReportController;
use App\Http\Controllers\Tenant\BranchReportController;
use App\Http\Controllers\Tenant\TenantNotificationController;
use App\Http\Controllers\Tenant\RoleController;
use App\Http\Controllers\Tenant\MemberDashboardController;
use App\Http\Controllers\Tenant\MemberReportController;


// ============================================================================
// PUBLIC — Tidak butuh autentikasi
// ============================================================================

Route::prefix('tenant')->group(function () {
    Route::get('/current', [TenantController::class, 'current']);
});

Route::get('/branches/{branch}/settings/public', [BranchSettingController::class, 'public']);

Route::prefix('member')->group(function () {
    Route::post('/register',    [MemberRegistrationController::class, 'register']);
    Route::post('/auth/login',  [MemberAuthController::class, 'login']);
    Route::post('/auth/forgot-password', [MemberAuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password',  [MemberAuthController::class, 'resetPassword']);
    Route::get('/auth/google',  [MemberAuthController::class, 'redirectToGoogle']);
    Route::get('/membershipAvailable', [MembershipPlanController::class, 'getAvailablePlans']);
});

Route::prefix('tenant-auth')->group(function () {
    Route::post('/login',           [StaffAuthController::class, 'login']);
    Route::post('/forgot-password', [StaffAuthController::class, 'forgotPassword']);
    Route::post('/reset-password',  [StaffAuthController::class, 'resetPassword']);
    Route::get('/google',           [StaffAuthController::class, 'redirectToGoogle']);
});

// ============================================================================
// MEMBER PROTECTED
// ============================================================================

Route::prefix('member')->middleware(['auth:member', 'check_tenant_access'])->group(function () {

    // Auth
    Route::get('/auth/me',               [MemberAuthController::class, 'me']);
    Route::post('/auth/logout',          [MemberAuthController::class, 'logout']);
    Route::post('/auth/change-password', [MemberAuthController::class, 'changePassword']);

    // Dashboard
    Route::get('/dashboard', [MemberDashboardController::class, 'index']);

    // Reports
    Route::get('/reports/summary', [MemberReportController::class, 'summary']);

    // Check-ins
    Route::post('/check-ins', [CheckInController::class, 'store']);

    // Class schedules
    Route::get('/class-schedules',              [MemberClassController::class, 'index']);
    Route::post('/class-schedules/{id}/book',   [MemberClassController::class, 'book']);
    Route::delete('/class-schedules/{id}/book', [MemberClassController::class, 'cancelBook']);
    Route::get('/my-classes',                   [MemberClassController::class, 'myClasses']);

    // Class booking (versi MemberClassBookingController)
    Route::post('/class-schedules/{id}/book-v2',   [MemberClassBookingController::class, 'book']);
    Route::delete('/class-schedules/{id}/book-v2', [MemberClassBookingController::class, 'cancel']);

    // PT
    Route::get('/pt-plans',             [MemberPtController::class, 'availablePlans']);
    Route::post('/pt-packages/purchase',[MemberPtController::class, 'purchase']);
    Route::get('/my-pt-packages',       [MemberPtController::class, 'myPackages']);

    // PT Sessions (individual sessions from purchased packages)
    Route::get('/my-pt-sessions',       [MemberPtController::class, 'mySessions']);
    Route::get('/trainers',             [MemberPtController::class, 'getTrainers']);
    Route::get('/trainers/{id}/booked-slots', [MemberPtController::class, 'getTrainerBookedSlots']);
    Route::post('/pt-sessions/request', [MemberPtController::class, 'requestSession']);

    // Membership
    Route::post('/memberships/upgrade', [MemberMembershipController::class, 'upgrade']);
});

// ============================================================================
// STAFF PROTECTED
// ============================================================================

Route::middleware(['auth:staff', 'check_tenant_access'])->group(function () {

    // Dashboard
    Route::get('/dashboard/summary', [TenantDashboardController::class, 'getSummary']);

    // Notification
    Route::get('/notifications', [TenantNotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [TenantNotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [TenantNotificationController::class, 'markAllAsRead']);

    // Reports (Owner)
    Route::get('/reports', [TenantReportController::class, 'index']);
    Route::get('/reports/export', [TenantReportController::class, 'export']);
    Route::get('/reports/branches', [TenantReportController::class, 'branches']);

    // Branch Reports
    Route::get('/branch-reports/{type}', [BranchReportController::class, 'show']);

    // Master permission list (any authenticated staff can read)
    Route::get('/permissions', [RoleController::class, 'availablePermissions']);
    Route::post('/permissions', [RoleController::class, 'storePermission'])->middleware('permission:settings');

    Route::middleware('permission:settings')->prefix('roles')->group(function () {
        Route::get('/', [RoleController::class, 'index']);
        Route::post('/', [RoleController::class, 'store']);
        Route::get('/{id}', [RoleController::class, 'show']);
        Route::put('/{id}', [RoleController::class, 'update']);
        Route::delete('/{id}', [RoleController::class, 'destroy']);
        Route::put('/{id}/permissions', [RoleController::class, 'syncPermissions']);
        Route::patch('/{id}/permissions/access', [RoleController::class, 'updateAccessLevel']);
    });

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout',          [StaffAuthController::class, 'logout']);
        Route::get('/me',               [StaffAuthController::class, 'me']);
        Route::post('/change-password', [StaffAuthController::class, 'changePassword']);
    });

    Route::prefix('tenant-auth')->group(function () {
        Route::get('/me',               [StaffAuthController::class, 'me']);
        Route::post('/change-password', [StaffAuthController::class, 'changePassword']);
        Route::post('/logout',          [StaffAuthController::class, 'logout']);
    });

    // Branch settings
    Route::get('/branches/{branch}/settings',         [BranchSettingController::class, 'index']);
    Route::put('/branches/{branch}/settings',         [BranchSettingController::class, 'update']);
    Route::put('/branches/{branch}/settings/{group}', [BranchSettingController::class, 'updateGroup']);
    Route::post('/branches/{branch}/settings/{group}/reset', [BranchSettingController::class, 'reset']);

    // Check-ins
    Route::get('/check-ins',  [CheckInController::class, 'index']);
    Route::post('/check-ins', [CheckInController::class, 'store']);

    // Class schedules
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

    Route::post('class-schedules/{id}/book-by-staff', [ClassScheduleController::class, 'bookByStaff']);

    // Facility bookings
    Route::apiResource('facility-bookings', FacilityBookingController::class);

    // ==========================================
    // MEMBERS (Staff Operations on Members)
    // ==========================================
    Route::prefix('members')->group(function () {
        // 1. Specific Endpoints (Tanpa ID) HARUS DI ATAS
        Route::get('/memberships/active',  [MemberController::class, 'activeMemberships']);
        Route::get('/memberships/history', [MemberController::class, 'membershipHistory']);

        // 2. Specific Endpoints (Dengan ID Member)
        Route::get('/{member}/memberships',                 [MemberController::class, 'memberships']);
        Route::post('/{member}/memberships',                [MemberController::class, 'assignMembership']);
        Route::patch('/{member}/memberships/{membership}',  [MemberController::class, 'updateMembership']);
        Route::delete('/{member}/memberships/{membership}', [MemberController::class, 'cancelMembership']);
        Route::post('/{member}/memberships/{membership}/freeze',   [MemberController::class, 'freezeMembership']);
        Route::post('/{member}/memberships/{membership}/unfreeze', [MemberController::class, 'unfreezeMembership']);

        // 3. Standard CRUD (Pengganti apiResource agar urutan tidak ditimpa Laravel)
        Route::get('/',           [MemberController::class, 'index']);
        Route::post('/',          [MemberController::class, 'store']);
        Route::get('/{member}',   [MemberController::class, 'show']);
        Route::put('/{member}',   [MemberController::class, 'update']);
        Route::delete('/{member}',[MemberController::class, 'destroy']);
    });

    // Staff
    Route::get('/staff',                              [StaffController::class, 'index']);
    Route::post('/staff',                             [StaffController::class, 'store']);
    Route::get('/staff/{staff}',                      [StaffController::class, 'show']);
    Route::put('/staff/{staff}',                      [StaffController::class, 'update']);
    Route::delete('/staff/{staff}',                   [StaffController::class, 'destroy']);
    Route::get('/staff/{staff}/branches',             [StaffController::class, 'branches']);
    Route::post('/staff/{staff}/branches',            [StaffController::class, 'assignBranch']);
    Route::delete('/staff/{staff}/branches/{branch}', [StaffController::class, 'revokeBranch']);

    // Membership plans
    Route::get('/membership-plans/categories',                        [MembershipPlanController::class, 'categories']);
    Route::apiResource('membership-plans', MembershipPlanController::class);
    Route::patch('/membership-plans/{plan}/toggle-active',            [MembershipPlanController::class, 'toggleActive']);
    Route::post('/membership-plans/{plan}/duplicate',                 [MembershipPlanController::class, 'duplicate']);
    Route::get('/membership-plans/{plan}/class-plans',                [MembershipPlanController::class, 'classPlans']);
    Route::post('/membership-plans/{plan}/class-plans/sync',          [MembershipPlanController::class, 'syncClassPlans']);
    Route::post('/membership-plans/{plan}/class-plans/attach',        [MembershipPlanController::class, 'attachClassPlan']);
    Route::delete('/membership-plans/{plan}/class-plans/{classPlan}', [MembershipPlanController::class, 'detachClassPlan']);

    // Class plans
    Route::get('/class-plans/categories',          [ClassPlanController::class, 'categories']);
    Route::apiResource('class-plans', ClassPlanController::class);
    Route::patch('/class-plans/{plan}/toggle-active', [ClassPlanController::class, 'toggleActive']);
    Route::post('/class-plans/{plan}/duplicate',      [ClassPlanController::class, 'duplicate']);
    Route::get('/class-plans/{plan}/membership-plans',[ClassPlanController::class, 'membershipPlans']);

    // PT session plans
    Route::get('/pt-session-plans/categories',             [PtSessionPlanController::class, 'categories']);
    Route::apiResource('pt-session-plans', PtSessionPlanController::class);
    Route::patch('/pt-session-plans/{plan}/toggle-active', [PtSessionPlanController::class, 'toggleActive']);
    Route::post('/pt-session-plans/{plan}/duplicate',      [PtSessionPlanController::class, 'duplicate']);

    // Facilities
    Route::get('/facilities/categories',                  [FacilityController::class, 'categories']);
    Route::apiResource('facilities', FacilityController::class);
    Route::patch('/facilities/{facility}/toggle-active',  [FacilityController::class, 'toggleActive']);

    // Products
    Route::get('/products/categories',                    [ProductController::class, 'categories']);
    Route::apiResource('products', ProductController::class);
    Route::patch('/products/{product}/toggle-active',     [ProductController::class, 'toggleActive']);
    Route::post('/products/{product}/stock/add',          [ProductController::class, 'addStock']);
    Route::post('/products/{product}/stock/adjust',       [ProductController::class, 'adjustStock']);
    Route::get('/products/{product}/stock/history',       [ProductController::class, 'stockHistory']);

    // PT sessions & packages
    Route::get('/pt-sessions/requests', [PtSessionController::class, 'getRequests']);
    Route::patch('/pt-sessions/{id}/approve', [PtSessionController::class, 'approveRequest']);
    Route::patch('/pt-sessions/{id}/reject',  [PtSessionController::class, 'rejectRequest']);
    Route::get('/pt-sessions',          [PtSessionController::class, 'index']);
    Route::post('/pt-sessions',         [PtSessionController::class, 'store']);
    Route::get('/pt-sessions/{id}',     [PtSessionController::class, 'show']);
    Route::put('/pt-sessions/{id}',     [PtSessionController::class, 'update']);
    Route::patch('/pt-sessions/{id}/mark-complete', [PtSessionController::class, 'markComplete']);
    Route::patch('/pt-sessions/{id}/notes',         [PtSessionController::class, 'updateNotes']);
    Route::patch('/pt-sessions/{id}/cancel', [PtSessionController::class, 'cancel']);
    Route::get('/pt-packages',          [PtPackageController::class, 'index']);
    Route::get('/pt-packages/{id}',     [PtPackageController::class, 'show']);

    // POS
    Route::prefix('pos')->middleware('permission:pos')->group(function () {
        Route::post('/checkout', [POSController::class, 'checkout']);
        Route::get('/history',   [POSController::class, 'history']);
    });

    // Subscription
    Route::get('/subscription/current', [SubscriptionTenantController::class, 'current']);
    Route::get('/subscription/history', [SubscriptionTenantController::class, 'history']);

    // Gym Settings — Logo Upload
    Route::post('/tenant/logo', [TenantController::class, 'uploadLogo']);

    // Misc
    Route::post('/upgrade', [PlanController::class, 'upgrade']);
});