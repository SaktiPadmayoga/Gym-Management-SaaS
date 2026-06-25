import re

with open('routes/tenant.php', 'r') as f:
    content = f.read()

# Define blocks to wrap
blocks = [
    # Reports
    ("Route::get('/reports', [TenantReportController::class, 'index']);", "Route::get('/branch-reports/{type}', [BranchReportController::class, 'show']);", 'reports'),
    
    # Check-ins
    ("Route::get('/check-ins',  [CheckInController::class, 'index']);", "Route::post('/check-ins', [CheckInController::class, 'store']);", 'check_ins'),
    
    # Class Schedules
    ("Route::prefix('class-schedules')->group(function () {", "Route::post('class-schedules/{id}/book-by-staff', [ClassScheduleController::class, 'bookByStaff']);", 'schedules'),
    
    # Facility Bookings
    ("Route::apiResource('facility-bookings', FacilityBookingController::class);", "Route::apiResource('facility-bookings', FacilityBookingController::class);", 'bookings'),
    
    # Members
    ("Route::prefix('members')->group(function () {", "Route::delete('/{member}',[MemberController::class, 'destroy']);\n    });", 'members'),
    
    # Staff
    ("Route::get('/staff',                              [StaffController::class, 'index']);", "Route::delete('/staff/{staff}/branches/{branch}', [StaffController::class, 'revokeBranch']);", 'staff'),
    
    # Master Data (Membership Plans, Class Plans, PT Session Plans, Facilities, Products)
    ("Route::get('/membership-plans/categories',                        [MembershipPlanController::class, 'categories']);", "Route::get('/products/{product}/stock/history',       [ProductController::class, 'stockHistory']);", 'master_data'),
    
    # PT Sessions & Packages
    ("Route::get('/pt-sessions/requests', [PtSessionController::class, 'getRequests']);", "Route::get('/pt-packages/{id}',     [PtPackageController::class, 'show']);", 'pt_sessions'),
]

for start_str, end_str, perm in blocks:
    start_idx = content.find(start_str)
    end_idx = content.find(end_str) + len(end_str)
    
    if start_idx != -1 and end_idx != -1:
        extracted = content[start_idx:end_idx]
        
        # indent extracted content
        indented = "\n".join("    " + line for line in extracted.split("\n"))
        
        wrapped = f"Route::middleware('permission:{perm}')->group(function () {{\n{indented}\n    }});"
        
        content = content[:start_idx] + wrapped + content[end_idx:]

with open('routes/tenant.php', 'w') as f:
    f.write(content)

