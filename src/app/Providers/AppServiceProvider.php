<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Branch;
use App\Observers\BranchObserver;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;
// JANGAN LUPA DUA IMPORT INI 👇
use Illuminate\Support\Facades\Gate;
use App\Models\Tenant\Staff;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // ---------------------------------------------------
        // 1. OBSERVERS
        // ---------------------------------------------------
        Branch::observe(BranchObserver::class);
        \App\Models\Tenant\TenantInvoice::observe(\App\Observers\Tenant\TenantInvoiceObserver::class);


        // ---------------------------------------------------
        // 2. SANCTUM MULTI-TENANT CONFIGURATION
        // ---------------------------------------------------
        // Paksa Sanctum selalu pakai connection central (pgsql) bukan tenant connection
        PersonalAccessToken::resolveRelationUsing('tokenable', function ($model) {
            return $model->morphTo('tokenable');
        });

        Sanctum::usePersonalAccessTokenModel(
            \App\Models\CustomPersonalAccessToken::class
        );

        Sanctum::authenticateAccessTokensUsing(function ($token, $isValid) {
            // Token sudah valid dari personal_access_tokens (central)
            // Sekarang resolve tokenable dari connection yang benar
            if (!$isValid) return null;

            $type = $token->tokenable_type;
            $id   = $token->tokenable_id;

            if (str_contains($type, 'Staff') || str_contains($type, 'Tenant\\Staff')) {
                // Staff ada di tenant DB — pakai current tenant connection
                return $type::on('tenant')->find($id);
            }

            return $token->tokenable;
        });


        // ---------------------------------------------------
        // 3. GATE & PERMISSIONS (Dipindah dari AuthServiceProvider)
        // ---------------------------------------------------
        // Owner bypass semua gate
        Gate::before(function (Staff $staff, string $ability) {
            if ($staff->isOwner()) return true;
        });

        $permissions = [
            'pos', 'members', 'check_ins', 'bookings',
            'pt_sessions', 'schedules', 'staff',
            'reports', 'settings', 'memberships', 'master_data',
        ];

        foreach ($permissions as $permission) {
            Gate::define($permission, function (Staff $staff, string $branchId) use ($permission) {
                return $staff->hasPermissionInBranch($permission, $branchId);
            });
        }
        
    }
}