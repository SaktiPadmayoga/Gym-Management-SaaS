<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlanController;

Route::get('/', function () {
    return 'CENTRAL APP';
});

// Route::prefix('api')->group(function () {
//     // Plans CRUD
    
// });

// Test tenant if needed
Route::get('/test-create-tenant', function () {
    $tenant = \App\Models\Tenant::create([
        'id' => 'manualtest' . time(),
        'data' => ['name' => 'Manual Test Gym'],
    ]);

    $tenant->domains()->create(['domain' => $tenant->id . '.localhost']);

    return 'Tenant dibuat: ' . $tenant->id . '<br>Domain: ' . $tenant->domains->first()->domain;
});