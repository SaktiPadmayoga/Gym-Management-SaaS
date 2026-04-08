<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Branch;
use App\Observers\BranchObserver;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;



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
            Branch::observe(BranchObserver::class);

            // Paksa Sanctum selalu pakai connection central (pgsql)
    // bukan tenant connection
    PersonalAccessToken::resolveRelationUsing('tokenable', function ($model) {
        return $model->morphTo('tokenable');
    });

    \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(
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

    }
}
