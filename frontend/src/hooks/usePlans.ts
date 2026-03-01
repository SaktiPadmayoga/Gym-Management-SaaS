import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { plansAPI } from "@/lib/api/plans";
import { PlanCreateRequest, PlansData } from "@/types/central/plans";

export type PlansQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
};

/* =====================================================
 * QUERY KEYS
 * ===================================================== */
export const planKeys = {
    all: ["plans"] as const,

    lists: () => [...planKeys.all, "list"] as const,

    list: (params?: PlansQueryParams) => [...planKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? ""] as const,

    details: () => [...planKeys.all, "detail"] as const,

    detail: (id: string) => [...planKeys.details(), id] as const,
};

/* =====================================================
 * GET ALL PLANS
 * ===================================================== */
export function usePlans(params?: PlansQueryParams) {
    return useQuery<PlansData[]>({
        queryKey: planKeys.list(params),
        queryFn: () => plansAPI.getAll(params),
        placeholderData: (prev) => prev,
        staleTime: 300_000,
    });
}

/* =====================================================
 * GET SINGLE PLAN
 * ===================================================== */
export function usePlan(id?: string) {
    return useQuery<PlansData>({
        queryKey: planKeys.detail(id as string),
        queryFn: () => plansAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================================================
 * CREATE PLAN
 * ===================================================== */
export function useCreatePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: PlanCreateRequest) => plansAPI.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
        },
        onError: (error) => {
            console.error("Create error:", error);
        },
    });
}

/* =====================================================
 * UPDATE PLAN
 * ===================================================== */
export function useUpdatePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<PlansData> }) => plansAPI.update(id, payload),

        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: planKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
        },
        onError: (error) => {
            console.error("Update error:", error);
        },
    });
}

/* =====================================================
 * DELETE PLAN (SOFT DELETE)
 * ===================================================== */
export function useDeletePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => plansAPI.delete(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
        },
        onError: (error) => {
            console.error("Delete error:", error);
        },
    });
}
