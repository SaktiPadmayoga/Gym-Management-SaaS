<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\DomainController;
use App\Http\Controllers\TenantUserController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\DomainRequestController;
use App\Http\Controllers\SubscriptionTenantController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\TenantRegistrationController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\StaffAuthController;
use App\Http\Controllers\Auth\MemberAuthController;
use App\Http\Controllers\Tenant\MemberRegistrationController;
use App\Http\Controllers\Tenant\MidtransWebhookController;
use App\Http\Controllers\CentralDashboardController;
use App\Http\Controllers\CentralReportController;
use App\Http\Controllers\CentralNotificationController;


Route::prefix('tenant-auth')->group(function () {
    Route::get('/google/callback', [StaffAuthController::class, 'handleGoogleCallback']);
// Pintu Gerbang Utama untuk menerima kembalian dari Google
    Route::get('/member/google/callback', [MemberAuthController::class, 'handleGoogleCallback'])
        ->name('member.google.callback');
});
    
    
// Rute Webhook Midtrans khusus Tenant (Bypass CSRF & Auth)
Route::post('/payment/member-webhook', [MidtransWebhookController::class, 'handle']);

// Rute public untuk landing page SaaS
Route::get('/public-plans', [\App\Http\Controllers\PublicPlanController::class, 'index']);

use Illuminate\Support\Facades\DB;

Route::get('/debug-central-db', function() {
    try {
        $tenants = DB::connection('central')->table('tenants')->get();
        $domains = DB::connection('central')->table('domains')->get();
        $subscriptions = DB::connection('central')->table('subscriptions')->get();
        
        // Query pg_database to list all database names
        $databases = DB::connection('central')->select("SELECT datname FROM pg_database WHERE datname LIKE 'gym_%'");
        
        // Let's dynamically test connecting to all tenant databases
        $tenantDbsStatus = [];
        foreach ($tenants as $t) {
            $dbName = 'gym_tenant_' . $t->id;
            $tenantTables = [];
            $tenantConnectionError = null;
            
            try {
                // Clone Central connection and override database name
                $config = config('database.connections.central');
                $config['database'] = $dbName;
                
                $connName = 'temp_tenant_test_' . $t->id;
                config(["database.connections.{$connName}" => $config]);
                
                // Try to get tables list
                $tenantTables = DB::connection($connName)->select("
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                ");
                $tenantTables = array_column($tenantTables, 'table_name');
                
                $staffs = [];
                if (in_array('staffs', $tenantTables)) {
                    $staffs = DB::connection($connName)->table('staffs')->select('id', 'name', 'email', 'role')->get();
                }
                
                $products = [];
                if (in_array('products', $tenantTables)) {
                    $products = DB::connection($connName)->table('products')->select('id', 'name', 'image')->get();
                }
            } catch (\Throwable $err) {
                $tenantConnectionError = $err->getMessage();
            }
            
            $tenantDbsStatus[$t->slug] = [
                'database' => $dbName,
                'connection_error' => $tenantConnectionError,
                'tables_count' => count($tenantTables),
                'tables' => $tenantTables,
                'staffs' => $staffs,
                'products' => $products,
            ];
        }
        
        return response()->json([
            'success' => true,
            'tenants' => $tenants,
            'domains' => $domains,
            'subscriptions' => $subscriptions,
            'databases' => $databases,
            'tenant_dbs_status' => $tenantDbsStatus
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString(),
        ], 500);
    }
});

Route::get('/read-laravel-log', function() {
    try {
        $logPath = storage_path('logs/laravel.log');
        if (!file_exists($logPath)) {
            return response()->json(['success' => false, 'message' => 'Log file not found']);
        }
        $lines = file($logPath);
        $lastLines = array_slice($lines, -800);
        return response()->json([
            'success' => true,
            'log' => $lastLines
        ]);
    } catch (\Throwable $e) {
        return response()->json(['success' => false, 'message' => $e->getMessage()]);
    }
});

// ============================================================
// ONE-TIME: Migrate product images dari local storage ke R2
// Jalankan SEKALI setelah R2 dikonfigurasi dengan benar.
// ============================================================
Route::get('/migrate-images-to-r2', function() {
    $results   = [];
    $totalOk   = 0;
    $totalFail = 0;
    $totalSkip = 0;

    $tenants = \Illuminate\Support\Facades\DB::table('tenants')->get();

    foreach ($tenants as $tenant) {
        $tenantId = $tenant->id;
        $dbName   = "gym_tenant_{$tenantId}";
        $connName = "tenant_{$tenantId}";

        // Daftarkan koneksi sementara ke database tenant
        config(["database.connections.{$connName}" => array_merge(
            config('database.connections.pgsql'),
            ['database' => $dbName]
        )]);

        try {
            \Illuminate\Support\Facades\DB::connection($connName)->getPdo();
        } catch (\Throwable $e) {
            $results[$tenant->slug ?? $tenantId] = ['error' => 'DB connect failed: ' . $e->getMessage()];
            continue;
        }

        $products = \Illuminate\Support\Facades\DB::connection($connName)
            ->table('products')
            ->whereNotNull('image')
            ->whereNull('deleted_at')
            ->get(['id', 'name', 'image']);

        $tenantResults = [];

        foreach ($products as $product) {
            $imagePath = $product->image;

            // Skip jika sudah di R2 (sudah ada di sana — cek via Storage)
            try {
                $existsInR2 = \Illuminate\Support\Facades\Storage::disk('r2')->exists($imagePath);
                if ($existsInR2) {
                    $tenantResults[] = ['name' => $product->name, 'status' => 'skip_already_in_r2'];
                    $totalSkip++;
                    continue;
                }
            } catch (\Throwable $e) {
                // R2 error saat cek — lanjut coba upload
            }

            // Coba cari file di local storage (public disk)
            $localPath = storage_path("app/public/{$imagePath}");

            // Juga coba path alternatif (tenant storage pattern)
            if (!file_exists($localPath)) {
                // Pattern: tenant_{uuid}/... → storage/app/public/tenant_{uuid}/...
                $localPath2 = storage_path("app/public/" . $imagePath);
                $localPath  = file_exists($localPath2) ? $localPath2 : null;
            }

            if (!$localPath || !file_exists($localPath)) {
                $tenantResults[] = [
                    'name'   => $product->name,
                    'status' => 'fail_local_not_found',
                    'path'   => $imagePath,
                ];
                $totalFail++;
                continue;
            }

            // Upload ke R2
            try {
                $fileContents = file_get_contents($localPath);
                $mimeType     = mime_content_type($localPath) ?: 'image/jpeg';

                \Illuminate\Support\Facades\Storage::disk('r2')->put(
                    $imagePath,
                    $fileContents,
                    ['ContentType' => $mimeType, 'visibility' => 'public']
                );

                $tenantResults[] = [
                    'name'   => $product->name,
                    'status' => 'ok_uploaded',
                    'path'   => $imagePath,
                    'url'    => \Illuminate\Support\Facades\Storage::disk('r2')->url($imagePath),
                ];
                $totalOk++;
            } catch (\Throwable $e) {
                $tenantResults[] = [
                    'name'   => $product->name,
                    'status' => 'fail_upload_error',
                    'error'  => $e->getMessage(),
                    'path'   => $imagePath,
                ];
                $totalFail++;
            }
        }

        $results[$tenant->slug ?? $tenantId] = $tenantResults;
    }

    return response()->json([
        'success'    => true,
        'summary'    => ['uploaded' => $totalOk, 'skipped' => $totalSkip, 'failed' => $totalFail],
        'details'    => $results,
    ]);
});

Route::get('/scan-storage', function() {
    try {
        $storagePath = storage_path();
        
        $files = [];
        $directory = new RecursiveDirectoryIterator($storagePath);
        $iterator = new RecursiveIteratorIterator($directory);
        
        foreach ($iterator as $fileinfo) {
            if ($fileinfo->isFile()) {
                $filePath = $fileinfo->getPathname();
                // Get path relative to storage_path
                $relative = str_replace($storagePath, '', $filePath);
                // Only show files with image extension or files in app/public
                if (preg_match('/\.(jpg|jpeg|png|gif|webp|svg)$/i', $filePath) || str_contains($relative, '/app/public')) {
                    $files[] = [
                        'path' => $relative,
                        'size' => $fileinfo->getSize(),
                    ];
                }
            }
        }
        
        return response()->json([
            'success' => true,
            'storage_path' => $storagePath,
            'files_count' => count($files),
            'files' => array_slice($files, 0, 200), // Limit to first 200 files
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
});

Route::get('/test-r2', function() {
    try {
        $disk = \Illuminate\Support\Facades\Storage::disk('r2');
        $fileName = 'test-' . time() . '.txt';
        
        // Temporarily force throw to true to get the exception
        config(['filesystems.disks.r2.throw' => true]);
        
        $disk->put($fileName, 'R2 Connection Test Successful');
        $exists = $disk->exists($fileName);
        $content = $exists ? $disk->get($fileName) : null;
        $url = $disk->url($fileName);
        
        // Clean up
        if ($exists) {
            $disk->delete($fileName);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'R2 connection is working!',
            'file_name' => $fileName,
            'exists' => $exists,
            'content' => $content,
            'generated_url' => $url,
            'config' => [
                'driver' => config('filesystems.disks.r2.driver'),
                'bucket' => config('filesystems.disks.r2.bucket'),
                'endpoint' => config('filesystems.disks.r2.endpoint'),
                'url' => config('filesystems.disks.r2.url'),
                'key_length' => strlen(config('filesystems.disks.r2.key') ?? ''),
                'secret_length' => strlen(config('filesystems.disks.r2.secret') ?? ''),
            ],
            'env_raw' => [
                'key_length' => strlen(env('CLOUDFLARE_R2_ACCESS_KEY_ID') ?? ''),
                'secret_length' => strlen(env('CLOUDFLARE_R2_SECRET_ACCESS_KEY') ?? ''),
                'bucket' => env('CLOUDFLARE_R2_BUCKET'),
                'endpoint' => env('CLOUDFLARE_R2_ENDPOINT'),
                'url' => env('CLOUDFLARE_R2_URL'),
            ]
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'success' => false,
            'message' => 'R2 connection failed: ' . $e->getMessage(),
            'class' => get_class($e),
            'trace' => substr($e->getTraceAsString(), 0, 1000),
            'config_cached' => [
                'driver' => config('filesystems.disks.r2.driver'),
                'bucket' => config('filesystems.disks.r2.bucket'),
                'endpoint' => config('filesystems.disks.r2.endpoint'),
                'url' => config('filesystems.disks.r2.url'),
                'key_length' => strlen(config('filesystems.disks.r2.key') ?? ''),
                'secret_length' => strlen(config('filesystems.disks.r2.secret') ?? ''),
            ],
            'env_raw' => [
                'key_length' => strlen(env('CLOUDFLARE_R2_ACCESS_KEY_ID') ?? ''),
                'secret_length' => strlen(env('CLOUDFLARE_R2_SECRET_ACCESS_KEY') ?? ''),
                'bucket' => env('CLOUDFLARE_R2_BUCKET'),
                'endpoint' => env('CLOUDFLARE_R2_ENDPOINT'),
                'url' => env('CLOUDFLARE_R2_URL'),
            ]
        ], 500);
    }
});

Route::prefix('auth')->middleware('throttle:auth')->group(function () {
    Route::post('/register-trial', [TenantRegistrationController::class, 'registerTrial']);
    Route::post('/register-paid', [TenantRegistrationController::class, 'registerPaid']);
});

// -----------------------------------------------
// Admin Auth — tidak perlu middleware tenant
// -----------------------------------------------
 
Route::prefix('admin/auth')->group(function () {
    // Public
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/login',           [AdminAuthController::class, 'login']);
        Route::post('/forgot-password', [AdminAuthController::class, 'forgotPassword']);
        Route::post('/reset-password',  [AdminAuthController::class, 'resetPassword']);
    });
 
    // Protected
    Route::middleware('auth:admin')->group(function () {
        Route::post('/logout',          [AdminAuthController::class, 'logout']);
        Route::get('/me',               [AdminAuthController::class, 'me']);
        Route::post('/change-password', [AdminAuthController::class, 'changePassword']);
    });
});
 
// ============================================
// ADMIN ROUTES (Require Admin Auth)
// ============================================
Route::middleware('auth:admin')->group(function () {
    Route::prefix('admin')->group(function () {
        Route::apiResource('admins', AdminController::class);
    });

    Route::get('/central/dashboard/summary', [CentralDashboardController::class, 'getSummary']);
    Route::get('/central/reports', [CentralReportController::class, 'index']);
    Route::get('/central/reports/export', [CentralReportController::class, 'export']);

    Route::get('/central/notifications', [CentralNotificationController::class, 'index']);
    Route::post('/central/notifications/{id}/read', [CentralNotificationController::class, 'markAsRead']);
    Route::post('/central/notifications/mark-all-read', [CentralNotificationController::class, 'markAllAsRead']);

    Route::post('plans/{id}/restore', [PlanController::class, 'restore']);
    Route::delete('plans/{id}/force', [PlanController::class, 'forceDelete']);

    Route::prefix('tenants')->group(function () {
        Route::get('/', [TenantController::class, 'index']);
        Route::post('/', [TenantController::class, 'store']);
        Route::get('/{tenant}', [TenantController::class, 'show']);
        Route::put('/{tenant}', [TenantController::class, 'update']);
        Route::delete('/{tenant}', [TenantController::class, 'destroy']);
        Route::post('/{id}/restore', [TenantController::class, 'restore']);
    });

    Route::prefix('plans')->group(function () {
        Route::get('/', [PlanController::class, 'index']);
        Route::post('/', [PlanController::class, 'store']);
        Route::get('{id}', [PlanController::class, 'show']);
        Route::get('{id}/edit', [PlanController::class, 'edit']);
        Route::put('{id}', [PlanController::class, 'update']);
        Route::patch('{id}/cancel', [PlanController::class, 'cancel']);
        Route::delete('{id}', [PlanController::class,'destroy']);
    });

    Route::apiResource('tenant-users', TenantUserController::class);

    Route::prefix('subscriptions')->group(function () {
        Route::get('/', [SubscriptionController::class, 'index']);
        Route::get('{id}', [SubscriptionController::class, 'show']);
        Route::get('{id}/edit', [SubscriptionController::class, 'edit']);
        Route::put('{id}', [SubscriptionController::class, 'update']);
        Route::patch('{id}/cancel', [SubscriptionController::class, 'cancel']);
    });

    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'index']);
        Route::get('/{id}', [PaymentController::class, 'show']);
    });

    Route::prefix('invoices')->group(function () {
        Route::get('/', [PaymentController::class, 'indexInvoices']);
        Route::get('/{id}', [PaymentController::class, 'showInvoice']);
    });
});

// ============================================
// TENANT-SCOPED ROUTES (tenant database)
// ============================================
Route::middleware([\App\Http\Middleware\InitializeTenancy::class, 'auth:staff', 'check_tenant_access'])->group(function () {
    Route::apiResource('branches', BranchController::class);
    Route::patch('branches/{branch}/toggle-active', [BranchController::class, 'toggleActive']);

    Route::get('/subscription/current', [SubscriptionTenantController::class, 'current']);
    Route::get('/subscription/history', [SubscriptionTenantController::class, 'history']);

    Route::post('/payment/token', [PaymentController::class, 'createToken']);
});

// ============================================
// DOMAIN ROUTES (SHARED ADMIN & STAFF)
// central database
// ============================================
Route::middleware([\App\Http\Middleware\InitializeTenancy::class, 'auth:admin,staff'])->group(function () {
    Route::apiResource('domains', DomainController::class);
    Route::patch('domains/{domain}/toggle-primary', [DomainController::class, 'togglePrimary']);

    Route::prefix('domain-requests')->group(function () {
        Route::get('/', [DomainRequestController::class, 'index']);
        Route::get('/my', [DomainRequestController::class, 'myRequests']);
        Route::post('/', [DomainRequestController::class, 'store']);
        Route::get('/{id}', [DomainRequestController::class, 'show']);
        Route::post('/{id}/review', [DomainRequestController::class, 'review']);
        Route::delete('/{id}', [DomainRequestController::class, 'destroy']);
    });
});

// Webhook — tanpa middleware, Midtrans yang call ini
Route::post('/payment/webhook', [PaymentController::class, 'webhook']);
