<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Stancl\Tenancy\Facades\Tenancy;

class CheckTenantAccess
{
    public function handle(Request $request, Closure $next)
    {
        $tenant = Tenancy::getTenant();

        if (!$tenant) {
            return $next($request);
        }

        // Reload fresh
        $tenant = $tenant->fresh();

        $subscription = $tenant->activeSubscription;

        // Check subscription
        if (!$subscription || $subscription->isExpired()) {
            // Grace period: 3 hari setelah expire
            if ($subscription->current_period_ends_at && now()->diffInDays($subscription->current_period_ends_at) <= 3) {
                $request->attributes->add(['subscription_warning' => 'Subscription akan expire segera. Upgrade segera!']);
            } else {
                return $this->denyAccess($tenant, 'Subscription expired atau tidak aktif. Silakan upgrade.');
            }
        }

        // Check jika pending (belum bayar)
        if ($subscription->status === 'pending') {
            return $this->denyAccess($tenant, 'Subscription pending pembayaran. Silakan selesaikan invoice terbaru.');
        }

        // Check limits dari plan
        $plan = $subscription->plan;

        $tenant->run(function () use ($plan) {
            if (!$plan->isUnlimitedMembers() && \App\Models\Member::count() >= $plan->max_membership) {
                abort(403, 'Limit anggota tercapai. Upgrade plan untuk menambah member.');
            }
            // Tambah check staff/branches jika ada modelnya
        });

        return $next($request);
    }

    private function denyAccess($tenant, $message)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'current_status' => $tenant->activeSubscription?->status ?? 'none',
            'trial_ends_at' => $tenant->trial_ends_at?->toDateTimeString(),
            'upgrade_url' => route('tenant.upgrade'),
            'plans_url' => route('tenant.plans'),
        ], 403);
    }
}