import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { classPlansAPI } from "@/lib/api/tenant/classPlans";
import { ClassPlanCreateRequest, ClassPlanData, ClassPlanUpdateRequest } from "@/types/tenant/class-plans";

export type ClassPlansQueryParams = {
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

export const classPlansKeys = {
    all: ["class-plans"] as const,
    lists: () => [...classPlansKeys.all, "list"] as const,
    list: (params?: ClassPlansQueryParams) => [...classPlansKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? "", params?.category ?? ""] as const,
    details: () => [...classPlansKeys.all, "detail"] as const,
    detail: (id: string) => [...classPlansKeys.details(), id] as const,
    categories: () => [...classPlansKeys.all, "categories"] as const,
};

/* =====================
 * GET ALL
 * ===================== */

export function useClassPlans(params?: ClassPlansQueryParams) {
    return useQuery({
        queryKey: classPlansKeys.list(params),
        queryFn: () => classPlansAPI.getAll(params),
        staleTime: 300_000,
        placeholderData: (prev) => prev,
    });
}

/* =====================
 * GET SINGLE
 * ===================== */

export function useClassPlan(id?: string) {
    return useQuery<ClassPlanData>({
        queryKey: classPlansKeys.detail(id as string),
        queryFn: () => classPlansAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * GET CATEGORIES
 * ===================== */

export function useClassPlanCategories() {
    return useQuery<string[]>({
        queryKey: classPlansKeys.categories(),
        queryFn: () => classPlansAPI.getCategories(),
        staleTime: 10 * 60 * 1000,
    });
}

/* =====================
 * CREATE
 * ===================== */

export function useCreateClassPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ClassPlanCreateRequest) => classPlansAPI.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: classPlansKeys.lists() });
            queryClient.invalidateQueries({ queryKey: classPlansKeys.categories() });
        },
        onError: (error) => console.error("Create class plan error:", error),
    });
}

/* =====================
 * UPDATE
 * ===================== */

export function useUpdateClassPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ClassPlanUpdateRequest }) => classPlansAPI.update(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: classPlansKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: classPlansKeys.lists() });
        },
        onError: (error) => console.error("Update class plan error:", error),
    });
}

/* =====================
 * DELETE
 * ===================== */

export function useDeleteClassPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => classPlansAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: classPlansKeys.lists() });
        },
        onError: (error) => console.error("Delete class plan error:", error),
    });
}

/* =====================
 * TOGGLE ACTIVE
 * ===================== */

export function useToggleClassPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => classPlansAPI.toggleActive(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: classPlansKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: classPlansKeys.lists() });
        },
    });
}

/* =====================
 * DUPLICATE
 * ===================== */

export function useDuplicateClassPlan() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => classPlansAPI.duplicate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: classPlansKeys.lists() });
        },
    });
}
