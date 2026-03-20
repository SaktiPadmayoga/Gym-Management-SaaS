import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ptSessionPlansAPI } from "@/lib/api/tenant/ptSessionPlans";
import { PtSessionPlanCreateRequest, PtSessionPlanData, PtSessionPlanUpdateRequest } from "@/types/tenant/pt-session-plans";

export type PtSessionPlansQueryParams = {
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

export const ptSessionPlanKeys = {
    all: ["pt-session-plans"] as const,
    lists: () => [...ptSessionPlanKeys.all, "list"] as const,
    list: (params?: PtSessionPlansQueryParams) => [...ptSessionPlanKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? "", params?.category ?? ""] as const,
    details: () => [...ptSessionPlanKeys.all, "detail"] as const,
    detail: (id: string) => [...ptSessionPlanKeys.details(), id] as const,
    categories: () => [...ptSessionPlanKeys.all, "categories"] as const,
};

/* =====================
 * GET ALL
 * ===================== */

export function usePtSessionPlans(params?: PtSessionPlansQueryParams) {
    return useQuery({
        queryKey: ptSessionPlanKeys.list(params),
        queryFn: () => ptSessionPlansAPI.getAll(params),
        staleTime: 300_000,
        placeholderData: (prev) => prev,
    });
}

/* =====================
 * GET SINGLE
 * ===================== */

export function usePtSessionPlan(id?: string) {
    return useQuery<PtSessionPlanData>({
        queryKey: ptSessionPlanKeys.detail(id as string),
        queryFn: () => ptSessionPlansAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * GET CATEGORIES
 * ===================== */

export function usePtSessionPlanCategories() {
    return useQuery<string[]>({
        queryKey: ptSessionPlanKeys.categories(),
        queryFn: () => ptSessionPlansAPI.getCategories(),
        staleTime: 10 * 60 * 1000,
    });
}

/* =====================
 * CREATE
 * ===================== */

export function useCreatePtSessionPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: PtSessionPlanCreateRequest) => ptSessionPlansAPI.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ptSessionPlanKeys.lists() });
            queryClient.invalidateQueries({ queryKey: ptSessionPlanKeys.categories() });
        },
        onError: (error) => console.error("Create PT session plan error:", error),
    });
}

/* =====================
 * UPDATE
 * ===================== */

export function useUpdatePtSessionPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: PtSessionPlanUpdateRequest }) => ptSessionPlansAPI.update(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ptSessionPlanKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: ptSessionPlanKeys.lists() });
        },
        onError: (error) => console.error("Update PT session plan error:", error),
    });
}

/* =====================
 * DELETE
 * ===================== */

export function useDeletePtSessionPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ptSessionPlansAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ptSessionPlanKeys.lists() });
        },
        onError: (error) => console.error("Delete PT session plan error:", error),
    });
}

/* =====================
 * TOGGLE ACTIVE
 * ===================== */

export function useTogglePtSessionPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ptSessionPlansAPI.toggleActive(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ptSessionPlanKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: ptSessionPlanKeys.lists() });
        },
    });
}

/* =====================
 * DUPLICATE
 * ===================== */

export function useDuplicatePtSessionPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => ptSessionPlansAPI.duplicate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ptSessionPlanKeys.lists() });
        },
    });
}
