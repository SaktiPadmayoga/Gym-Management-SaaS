<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Http\Responses\ApiResponse;

class CheckBranchAccess
{
    /**
     * Handle an incoming request.
     *
     * Validates that the staff member has access to the branch specified in X-Branch-Id.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        $staff = $request->user('staff');

        // Jika bukan request dari staff (misal member), lewati saja.
        if (!$staff) {
            return $next($request);
        }

        // Owner memiliki akses ke semua branch
        if ($staff->isOwner()) {
            return $next($request);
        }

        $branchId = $request->header('X-Branch-Id');

        // Jika endpoint tidak menggunakan X-Branch-Id, biarkan lewat.
        // Validasi branch hanya terjadi jika header tersebut disediakan.
        if ($branchId) {
            if (!$staff->hasAccessToBranch($branchId)) {
                return ApiResponse::error('Unauthorized — you do not have access to this branch', null, 403);
            }
        }

        return $next($request);
    }
}
