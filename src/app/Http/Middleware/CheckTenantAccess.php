<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Facades\Tenancy;
use Illuminate\Support\Facades\Log;

class CheckTenantAccess
{
    /**
     * Daftar rute yang tetap bisa diakses oleh Owner meskipun subscription expired.
     */
    private array $ownerWhitelist = [
        'api/tenant/current',
        'api/subscription/current',
        'api/subscription/history',
        'api/upgrade',
        'api/tenant-auth/logout',
        'api/auth/logout',
    ];

    public function handle(Request $request, Closure $next)
    {
        $tenant = tenant();

        if (!$tenant) {
            return $next($request);
        }

        $tenant = $tenant->fresh();
        $subscription = $tenant->activeSubscription;
        
        $user = $request->user('staff') ?? $request->user('member') ?? $request->user();
        
        $isOwner = false;
        if ($user && method_exists($user, 'isOwner')) {
            $isOwner = $user->isOwner();
        }

        $isWhitelisted = false;
        foreach ($this->ownerWhitelist as $route) {
            if ($request->is($route) || $request->is($route . '/*')) {
                $isWhitelisted = true;
                break;
            }
        }

        if ($tenant->status === 'suspended') {
            if ($isOwner && $isWhitelisted) {
            } else {
                if (!$isOwner && ($request->is('api/tenant-auth/logout') || $request->is('api/member/auth/logout'))) {
                    return $next($request);
                }
                return $this->denyAccess($tenant, 'Layanan gym Anda ditangguhkan (suspended). Silakan hubungi Customer Support.', 'suspended');
            }
        }

        if ($tenant->status === 'expired') {
            if ($isOwner && $isWhitelisted) {
            } else {
                if (!$isOwner && ($request->is('api/tenant-auth/logout') || $request->is('api/member/auth/logout'))) {
                    return $next($request);
                }
                return $this->denyAccess($tenant, 'Layanan gym Anda telah kedaluwarsa. Silakan perbarui langganan Anda.', 'expired');
            }
        }

        if ($subscription && $subscription->status === 'pending') {
            if ($isOwner && $isWhitelisted) {
            } else {
                return $this->denyAccess($tenant, 'Subscription pending pembayaran. Silakan selesaikan invoice terbaru.', 'pending');
            }
        }

        if (!$subscription || $subscription->isExpired()) {
            $isInGracePeriod = false;
            if ($subscription && $subscription->current_period_ends_at) {
                $daysPast = now()->diffInDays($subscription->current_period_ends_at, false);
                if ($daysPast < 0 && abs($daysPast) <= 3) {
                     $isInGracePeriod = true;
                }
            }

            if ($isInGracePeriod) {
                $response = $next($request);
                $response->headers->set('X-Subscription-Warning', 'Subscription telah kedaluwarsa. Layanan akan segera diblokir. Silakan perbarui layanan segera.');
                return $response;
            }

            
            if ($isOwner) {
                if (!$isWhitelisted) {
                    return $this->denyAccess($tenant, 'Subscription telah kedaluwarsa. Akses dibatasi. Silakan perbarui layanan Anda.', 'expired');
                }
            } else {
                if ($request->is('api/tenant-auth/logout') || $request->is('api/member/auth/logout')) {
                    return $next($request);
                }
                return $this->denyAccess($tenant, 'Layanan gym saat ini tidak aktif. Silakan hubungi pemilik gym.', 'expired');
            }
        }

        $response = $next($request);
        if ($subscription && $subscription->current_period_ends_at) {
             $daysUntilExpire = now()->diffInDays($subscription->current_period_ends_at, false);
             if ($daysUntilExpire >= 0 && $daysUntilExpire <= 7) {
                  $response->headers->set('X-Subscription-Warning', "Subscription akan expire dalam {$daysUntilExpire} hari.");
             }
        }

        if ($subscription && !$subscription->isExpired() && $subscription->status !== 'pending') {
            $plan = $subscription->plan;
            if ($plan) {
                $tenant->run(function () use ($plan) {
                    if (!$plan->isUnlimitedMembers() && \App\Models\Tenant\Member::count() >= $plan->max_membership) {
                        // Jangan abort, tapi berikan warning atau batasi pembuatan (biasanya di create endpoint)
                        // Untuk middleware general, kita lewati saja agar tidak memblokir GET request.
                    }
                });
            }
        }

        return $response;
    }

    private function denyAccess($tenant, $message, $reason)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'reason'  => $reason,
            'current_status' => $tenant->activeSubscription?->status ?? 'none',
            'upgrade_url' => '/owner/subscription', // frontend route
        ], 403);
    }
}