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

        // Reload fresh to get the latest DB state
        $tenant = $tenant->fresh();
        $subscription = $tenant->activeSubscription;
        
        // Dapatkan user yang sedang login (bisa staff/owner atau member)
        $user = $request->user('staff') ?? $request->user('member') ?? $request->user();
        
        $isOwner = false;
        if ($user && method_exists($user, 'isOwner')) {
            $isOwner = $user->isOwner();
        }

        // Cek apakan current path ada di whitelist
        $isWhitelisted = false;
        foreach ($this->ownerWhitelist as $route) {
            if ($request->is($route) || $request->is($route . '/*')) {
                $isWhitelisted = true;
                break;
            }
        }

        // 1. Check jika pending (belum bayar)
        if ($subscription && $subscription->status === 'pending') {
            if ($isOwner && $isWhitelisted) {
                 // Izinkan owner bayar
            } else {
                return $this->denyAccess($tenant, 'Subscription pending pembayaran. Silakan selesaikan invoice terbaru.', 'pending');
            }
        }

        // 2. Check subscription expired atau tidak ada subscription aktif
        if (!$subscription || $subscription->isExpired()) {
            
            // Cek Grace period: 3 hari setelah expire
            $isInGracePeriod = false;
            if ($subscription && $subscription->current_period_ends_at) {
                $daysPast = now()->diffInDays($subscription->current_period_ends_at, false); // false = negative if past
                if ($daysPast < 0 && abs($daysPast) <= 3) {
                     $isInGracePeriod = true;
                }
            }

            if ($isInGracePeriod) {
                // Masih grace period, tambahkan warning header tapi allow access
                $response = $next($request);
                $response->headers->set('X-Subscription-Warning', 'Subscription telah kedaluwarsa. Layanan akan segera diblokir. Silakan perbarui layanan segera.');
                return $response;
            }

            // --- BENAR-BENAR EXPIRED ---
            
            if ($isOwner) {
                // Owner hanya bisa akses whitelist
                if (!$isWhitelisted) {
                    return $this->denyAccess($tenant, 'Subscription telah kedaluwarsa. Akses dibatasi. Silakan perbarui layanan Anda.', 'expired');
                }
            } else {
                // Staff / Member -> Blokir total (kecuali logout)
                if ($request->is('api/tenant-auth/logout') || $request->is('api/member/auth/logout')) {
                    return $next($request);
                }
                return $this->denyAccess($tenant, 'Layanan gym saat ini tidak aktif. Silakan hubungi pemilik gym.', 'expired');
            }
        }

        // 3. Tambahkan Warning Header jika mendekati expire (< 7 hari)
        $response = $next($request);
        if ($subscription && $subscription->current_period_ends_at) {
             $daysUntilExpire = now()->diffInDays($subscription->current_period_ends_at, false);
             if ($daysUntilExpire >= 0 && $daysUntilExpire <= 7) {
                  $response->headers->set('X-Subscription-Warning', "Subscription akan expire dalam {$daysUntilExpire} hari.");
             }
        }

        // 4. Check limits dari plan (Opsional, dilakukan jika aktif)
        if ($subscription && !$subscription->isExpired() && $subscription->status !== 'pending') {
            $plan = $subscription->plan;
            if ($plan) {
                $tenant->run(function () use ($plan) {
                    if (!$plan->isUnlimitedMembers() && \App\Models\Member::count() >= $plan->max_membership) {
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