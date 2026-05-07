<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Http\Resources\SubscriptionResource;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubscriptionController extends Controller
{

    /**
     * List subscriptions
     * GET /api/subscriptions
     */
    public function index(Request $request)
    {
        $perPage = min((int) $request->get('per_page', 10), 100); // cap max 100
        $search  = $request->get('search');

        $query = Subscription::select('subscriptions.*')
            ->join('tenants', 'tenants.id', '=', 'subscriptions.tenant_id')
            ->join('plans',   'plans.id',   '=', 'subscriptions.plan_id')
            ->with(['tenant', 'plan']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('tenants.name', 'ilike', "%{$search}%")
                ->orWhere('plans.name',  'ilike', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $statuses = explode(',', $request->status);
            $query->whereIn('subscriptions.status', $statuses);
        }

        $subscriptions = $query
            ->orderBy('subscriptions.created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data'    => SubscriptionResource::collection($subscriptions->items()),
            'meta'    => [
                'current_page' => $subscriptions->currentPage(),
                'per_page'     => $subscriptions->perPage(),
                'total'        => $subscriptions->total(),
                'last_page'    => $subscriptions->lastPage(),
            ],
        ]);
    }


    /**
     * Show detail subscription
     * GET /api/subscriptions/{id}
     */
    public function show(string $id)
    {
        $subscription = Subscription::with(['tenant', 'plan'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new SubscriptionResource($subscription),
        ]);
    }

    /**
     * Edit subscription (data for edit form)
     * GET /api/subscriptions/{id}/edit
     */
    public function edit(string $id)
    {
        $subscription = Subscription::with(['tenant', 'plan'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => new SubscriptionResource($subscription),
        ]);
    }

    /**
     * Update subscription
     * PUT /api/subscriptions/{id}
     */
    public function update(Request $request, string $id)
    {
        $subscription = Subscription::findOrFail($id);

        $validated = $request->validate([
            'plan_id' => ['required', 'exists:plans,id'],
            'status' => ['required', Rule::in(['trial', 'active', 'past_due', 'cancelled', 'expired'])],
            'billing_cycle' => ['required', Rule::in(['monthly', 'yearly'])],
            'amount' => ['required', 'numeric', 'min:0'],
            'auto_renew' => ['required', 'boolean'],

            'started_at' => ['nullable', 'date'],
            'trial_ends_at' => ['nullable', 'date'],
            'current_period_ends_at' => ['nullable', 'date'],
            'canceled_at' => ['nullable', 'date'],
        ]);

        $subscription->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Subscription updated successfully',
            'data' => new SubscriptionResource($subscription),
        ]);
    }

    /**
 * Cancel subscription
 * PATCH /api/subscriptions/{id}/cancel
 */
public function cancel(string $id)
{
    $subscription = Subscription::findOrFail($id);

    // Kalau sudah cancelled / expired, tidak perlu cancel lagi
    if (in_array($subscription->status, ['cancelled', 'expired'])) {
        return response()->json([
            'success' => false,
            'message' => 'Subscription already cancelled or expired',
        ], 400);
    }

    $subscription->update([
        'status' => 'cancelled',
        'auto_renew' => false,
        'canceled_at' => now(),
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Subscription cancelled successfully',
        'data' => new SubscriptionResource($subscription),
    ]);
}

    
    
}
