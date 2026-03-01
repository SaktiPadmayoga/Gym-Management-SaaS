<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;

/**
 * Middleware untuk menginisialisasi tenancy secara programatik.
 * 
 * Ini digunakan untuk route di central api.php yang perlu akses tenant database.
 * Cara kerja:
 * 1. Ambil subdomain dari hostname request (misal: gymbali dari gymbali.localhost)
 * 2. Cari tenant berdasarkan slug
 * 3. Initialize tenancy context sehingga model query ke tenant database
 */
class InitializeTenancy
{
    // app/Http/Middleware/InitializeTenancy.php
public function handle(Request $request, Closure $next)
{
    $tenantSlug = $request->header('X-Tenant');

    $tenant = Tenant::where('slug', $tenantSlug)->first();

    if (!$tenant) {
        return response()->json(['success' => false, 'message' => 'Tenant not found'], 404);
    }

    tenancy()->initialize($tenant); // ✅ pastikan ini ada

    $response = $next($request); // ✅ next dipanggil SETELAH initialize

    tenancy()->end();

    return $response;
}
}
