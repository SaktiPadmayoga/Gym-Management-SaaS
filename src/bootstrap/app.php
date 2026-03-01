<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register tenant middleware alias for Stancl Tenancy
        $middleware->alias([
            'tenant' => \Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
            'check_tenant_access' => \App\Http\Middleware\CheckTenantAccess::class,
            'check.tenant.access' => \App\Http\Middleware\CheckTenantAccess::class,
            'tenant.header'=> \App\Http\Middleware\InitializeTenancy::class,

        ]);
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

        $middleware->validateCsrfTokens(except: [
            'api/payment/webhook',
        ]);
    
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        
    })
    
    ->create();
