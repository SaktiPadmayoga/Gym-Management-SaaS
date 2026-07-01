<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;

class InitializeTenancy
{
    public function handle(Request $request, Closure $next)
    {
        $tenantSlug = $request->header('X-Tenant');

        if (!$tenantSlug) {
            return $next($request);
        }

        $tenant = Tenant::where('slug', $tenantSlug)->first();

        if (!$tenant) {
            return response()->json(['success' => false, 'message' => 'Tenant not found'], 404);
        }

        tenancy()->initialize($tenant);

        $response = $next($request);

        tenancy()->end();

        return $response;
    }
}
