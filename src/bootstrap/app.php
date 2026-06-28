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
        $middleware->api(prepend: [
            \Illuminate\Routing\Middleware\ThrottleRequests::class.':api',
        ]);
        
        $middleware->trustProxies(at: '*');
        $middleware->prepend(\App\Http\Middleware\InjectTokenFromCookie::class);
        $middleware->prepend(\Illuminate\Cookie\Middleware\EncryptCookies::class);
        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);

        $middleware->alias([
            'tenant'                => \Stancl\Tenancy\Middleware\InitializeTenancyByDomain::class,
            'check_tenant_access'   => \App\Http\Middleware\CheckTenantAccess::class,
            'check.tenant.access'   => \App\Http\Middleware\CheckTenantAccess::class,
            'check_branch_access'   => \App\Http\Middleware\CheckBranchAccess::class,
            'tenant.header'         => \App\Http\Middleware\InitializeTenancy::class,
            'permission'            => \App\Http\Middleware\CheckPermission::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'api/payment/webhook',
            'api/*',
            'api/webhook/midtrans',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            // Selalu kembalikan JSON jika path mengandung /api/ untuk memudahkan debugging remote
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Exception caught globally',
                    'error' => $e->getMessage(),
                    'class' => get_class($e),
                    'trace' => substr($e->getTraceAsString(), 0, 2000), // Batasi panjang trace
                ], 500);
            }
        });
    })
    
    ->create();
