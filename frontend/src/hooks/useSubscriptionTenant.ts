import { useQuery } from "@tanstack/react-query";
import { subscriptionTenantAPI } from "@/lib/api/subscriptionTenant";

export const subscriptionTenantKeys = {
    all: ["subscription-tenant"] as const,
    current: () => [...subscriptionTenantKeys.all, "current"] as const,
    history: () => [...subscriptionTenantKeys.all, "history"] as const,
};

export function useCurrentSubscription() {
    return useQuery({
        queryKey: subscriptionTenantKeys.current(),
        queryFn: () => subscriptionTenantAPI.getCurrent(),
        staleTime: 5 * 60_000,
    });
}

export function useSubscriptionHistory() {
    return useQuery({
        queryKey: subscriptionTenantKeys.history(),
        queryFn: () => subscriptionTenantAPI.getHistory(),
        staleTime: 5 * 60_000,
    });
}

export function usePlansForUpgrade() {
    return useQuery({
        queryKey: [...subscriptionTenantKeys.all, "plans"],
        queryFn: () => subscriptionTenantAPI.getPlans(),
        staleTime: 10 * 60_000,
    });
}