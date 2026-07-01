<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumToken;
use Illuminate\Support\Facades\Log;

class CustomPersonalAccessToken extends SanctumToken
{
    // Paksa pakai connection central selalu
    protected $connection = 'central';
    protected $table = 'personal_access_tokens';

    /**
     * Override tokenable() agar tenancy diinisialisasi SEBELUM
     * morphTo menjalankan query ke tabel staffs di tenant DB.
     *
     * Ini mencakup SEMUA code path Sanctum yang mengakses $token->tokenable,
     * baik via Guard maupun via authenticateAccessTokensUsing callback.
     */
    public function tokenable()
    {
        // Jika tokenable_type adalah Staff, pastikan tenancy aktif
        if (str_contains($this->tokenable_type ?? '', 'Staff')) {
            if (!tenancy()->initialized) {
                $tenantSlug = request()->header('X-Tenant');

                Log::info('[CustomPersonalAccessToken] tokenable() called, tenancy not initialized', [
                    'tokenable_type' => $this->tokenable_type,
                    'tokenable_id'   => $this->tokenable_id,
                    'x_tenant'       => $tenantSlug,
                ]);

                if ($tenantSlug) {
                    $tenant = \App\Models\Tenant::where('slug', $tenantSlug)->first();
                    if ($tenant) {
                        tenancy()->initialize($tenant);
                        Log::info('[CustomPersonalAccessToken] tenancy initialized for: ' . $tenantSlug);
                    }
                }
            }
        }

        return $this->morphTo('tokenable');
    }
}