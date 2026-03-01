<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    protected $except = [
        'test-dashboard',             // Exclude route ini
        'test-dashboard/*',           // Jika ada sub-route
        'upgrade',                    // Exclude upgrade POST juga sementara
        'api/*',                      // Exclude API routes
    ];
}