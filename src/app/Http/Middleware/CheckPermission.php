<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Http\Responses\ApiResponse;
use Illuminate\Support\Facades\Gate; // Jangan lupa import ini

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): mixed
    {
        $branchId = $request->header('X-Branch-Id');
        $staff = $request->user('staff');

        if (!$branchId) {
            return ApiResponse::error('Branch context required', null, 422);
        }

        if (!$staff) {
            return ApiResponse::error('Unauthenticated', null, 401);
        }

        if (!$staff->can($permission, $branchId)) {
            return ApiResponse::error('Unauthorized', null, 403);
        }

        return $next($request);
    }
}