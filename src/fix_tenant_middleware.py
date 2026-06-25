import re

with open('app/Http/Middleware/CheckTenantAccess.php', 'r') as f:
    content = f.read()

# Replace the fresh() and activeSubscription with Cache::remember
old_code_1 = """        $tenant = $tenant->fresh();
        $subscription = $tenant->activeSubscription;"""

new_code_1 = """        // Cache active subscription for 5 minutes to prevent heavy N+1 central DB queries
        $subscription = \\Illuminate\\Support\\Facades\\Cache::remember(
            "tenant.{$tenant->id}.active_subscription",
            300,
            function () use ($tenant) {
                return $tenant->fresh()->activeSubscription;
            }
        );"""

content = content.replace(old_code_1, new_code_1)

# Remove the member count validation
old_code_2 = """        if ($subscription && !$subscription->isExpired() && $subscription->status !== 'pending') {
            $plan = $subscription->plan;
            if ($plan) {
                $tenant->run(function () use ($plan) {
                    if (!$plan->isUnlimitedMembers() && \\App\\Models\\Tenant\\Member::count() >= $plan->max_membership) {
                        // Jangan abort, tapi berikan warning atau batasi pembuatan (biasanya di create endpoint)
                        // Untuk middleware general, kita lewati saja agar tidak memblokir GET request.
                    }
                });
            }
        }"""

new_code_2 = """        // Member quota check has been moved to POST /api/tenant/members to prevent N+1 queries on every request."""

content = content.replace(old_code_2, new_code_2)

with open('app/Http/Middleware/CheckTenantAccess.php', 'w') as f:
    f.write(content)
