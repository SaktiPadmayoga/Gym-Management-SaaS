import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionsAPI } from "@/lib/api/subscriptions";
import { SubscriptionsData, SubscriptionCreateRequest } from "@/types/central/subscriptions";

export type SubscriptionsQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
};

/* =====================================================
 * QUERY KEYS
 * ===================================================== */
export const subscriptionKeys = {
    all: ["subscriptions"] as const,

    lists: () => [...subscriptionKeys.all, "list"] as const,

    list: (params?: SubscriptionsQueryParams) => [...subscriptionKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? ""] as const,

    details: () => [...subscriptionKeys.all, "detail"] as const,

    detail: (id: string) => [...subscriptionKeys.details(), id] as const,
};

/* =====================================================
 * GET ALL SUBSCRIPTIONS
 * ===================================================== */
export function useSubscriptions(params?: SubscriptionsQueryParams) {
    return useQuery<SubscriptionsData[]>({
        queryKey: subscriptionKeys.list(params),
        queryFn: () => subscriptionsAPI.getAll(params),
        placeholderData: (prev) => prev,
        staleTime: 300_000,
    });
}

/* =====================================================
 * GET SINGLE SUBSCRIPTION
 * ===================================================== */
export function useSubscription(id?: string) {
    return useQuery<SubscriptionsData>({
        queryKey: subscriptionKeys.detail(id as string),
        queryFn: () => subscriptionsAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================================================
 * CREATE SUBSCRIPTION
 * ===================================================== */
export function useCreateSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: SubscriptionCreateRequest) => subscriptionsAPI.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
        },
        onError: (error) => {
            console.error("Create subscription error:", error);
        },
    });
}

/* =====================================================
 * UPDATE SUBSCRIPTION
 * ===================================================== */
export function useUpdateSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<SubscriptionsData> }) => subscriptionsAPI.update(id, payload),

        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
        },
        onError: (error) => {
            console.error("Update subscription error:", error);
        },
    });
}

/* =====================================================
 * CANCEL SUBSCRIPTION
 * ===================================================== */
export function useCancelSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => subscriptionsAPI.cancel(id),

        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
        },
        onError: (error) => {
            console.error("Cancel subscription error:", error);
        },
    });
}

/* =====================================================
 * DELETE SUBSCRIPTION (SOFT DELETE)
 * ===================================================== */
export function useDeleteSubscription() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => subscriptionsAPI.delete(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() });
        },
        onError: (error) => {
            console.error("Delete subscription error:", error);
        },
    });
}
