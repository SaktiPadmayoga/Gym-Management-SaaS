import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { membershipPlansAPI } from "@/lib/api/tenant/membershipPlans";
import { MembershipPlanCreateRequest, MembershipPlanData, MembershipPlanUpdateRequest } from "@/types/tenant/membership-plans";

export type MembershipPlansQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
    is_active?: boolean;
    available_only?: boolean;
};

/* =====================
 * QUERY KEYS
 * ===================== */

export const membershipPlanKeys = {
    all: ["membership-plans"] as const,
    lists: () => [...membershipPlanKeys.all, "list"] as const,
    list: (params?: MembershipPlansQueryParams) => [...membershipPlanKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? "", params?.category ?? ""] as const,
    details: () => [...membershipPlanKeys.all, "detail"] as const,
    detail: (id: string) => [...membershipPlanKeys.details(), id] as const,
    categories: () => [...membershipPlanKeys.all, "categories"] as const,
};

/* =====================
 * GET ALL
 * ===================== */

export function useMembershipPlans(params?: MembershipPlansQueryParams) {
    return useQuery({
        queryKey: membershipPlanKeys.list(params),
        queryFn: () => membershipPlansAPI.getAll(params),
        staleTime: 300_000,
        placeholderData: (prev) => prev,
    });
}

/* =====================
 * GET SINGLE
 * ===================== */

export function useMembershipPlan(id?: string) {
    return useQuery<MembershipPlanData>({
        queryKey: membershipPlanKeys.detail(id as string),
        queryFn: () => membershipPlansAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * GET CATEGORIES
 * ===================== */

export function useMembershipPlanCategories() {
    return useQuery<string[]>({
        queryKey: membershipPlanKeys.categories(),
        queryFn: () => membershipPlansAPI.getCategories(),
        staleTime: 10 * 60 * 1000,
    });
}

/* =====================
 * CREATE
 * ===================== */

export function useCreateMembershipPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: MembershipPlanCreateRequest) => membershipPlansAPI.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: membershipPlanKeys.lists() });
            queryClient.invalidateQueries({ queryKey: membershipPlanKeys.categories() });
        },
        onError: (error) => console.error("Create membership plan error:", error),
    });
}

/* =====================
 * UPDATE
 * ===================== */

export function useUpdateMembershipPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: MembershipPlanUpdateRequest }) => membershipPlansAPI.update(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: membershipPlanKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: membershipPlanKeys.lists() });
        },
        onError: (error) => console.error("Update membership plan error:", error),
    });
}

/* =====================
 * DELETE
 * ===================== */

export function useDeleteMembershipPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => membershipPlansAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: membershipPlanKeys.lists() });
        },
        onError: (error) => console.error("Delete membership plan error:", error),
    });
}

/* =====================
 * TOGGLE ACTIVE
 * ===================== */

export function useToggleMembershipPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => membershipPlansAPI.toggleActive(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: membershipPlanKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: membershipPlanKeys.lists() });
        },
    });
}

/* =====================
 * DUPLICATE
 * ===================== */

export function useDuplicateMembershipPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => membershipPlansAPI.duplicate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: membershipPlanKeys.lists() });
        },
    });
}

/* =====================
 * SYNC CLASS PLANS
 * ===================== */

export function useSyncClassPlans() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, classPlansIds }: { id: string; classPlansIds: string[] }) => membershipPlansAPI.syncClassPlans(id, classPlansIds),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: membershipPlanKeys.detail(id) });
        },
    });
}
