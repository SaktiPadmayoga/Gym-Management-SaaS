<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Http\Responses\ApiResponse;

class CheckPermission
{
    /**
     * Handle an incoming request.
     *
     * Supports both coarse and granular permission checks:
     * - "members"        → true if role has any members.* permission
     * - "members.view"   → true if role has exact members.view
     * - "members.manage" → true if role has exact members.manage
     */
    public function handle(Request $request, Closure $next, string $permission): mixed
    {
        $staff = $request->user('staff');

        if (!$staff) {
            return ApiResponse::error('Unauthenticated', null, 401);
        }

        // Owner has absolute tenant-level permissions and is not bound to a branch context
        if ($staff->isOwner()) {
            return $next($request);
        }

        $branchId = $request->header('X-Branch-Id');
        if (!$branchId) {
            return ApiResponse::error('Branch context required', null, 422);
        }

        if (!$staff->hasPermissionInBranch($permission, $branchId)) {
            return ApiResponse::error('Unauthorized — insufficient permissions', null, 403);
        }

        return $next($request);
    }
}