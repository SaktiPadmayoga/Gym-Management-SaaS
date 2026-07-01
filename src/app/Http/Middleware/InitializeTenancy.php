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

        \Illuminate\Support\Facades\Log::info('[InitializeTenancy] Incoming request', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'x_tenant' => $tenantSlug,
            'has_auth' => $request->hasHeader('Authorization'),
            'all_headers' => collect($request->headers->all())->map(fn($v) => $v[0])->toArray(),
        ]);

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
