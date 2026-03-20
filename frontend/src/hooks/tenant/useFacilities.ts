import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { facilitiesAPI } from "@/lib/api/tenant/facilities";
import { FacilityCreateRequest, FacilityData, FacilityUpdateRequest } from "@/types/tenant/facilities";

export type FacilitiesQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    category?: string;
    access_type?: string;
    is_active?: boolean;
    available_only?: boolean;
};

/* =====================
 * QUERY KEYS
 * ===================== */

export const facilityKeys = {
    all: ["facilities"] as const,
    lists: () => [...facilityKeys.all, "list"] as const,
    list: (params?: FacilitiesQueryParams) => [...facilityKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? "", params?.category ?? ""] as const,
    details: () => [...facilityKeys.all, "detail"] as const,
    detail: (id: string) => [...facilityKeys.details(), id] as const,
    categories: () => [...facilityKeys.all, "categories"] as const,
};

/* =====================
 * GET ALL
 * ===================== */

export function useFacilities(params?: FacilitiesQueryParams) {
    return useQuery({
        queryKey: facilityKeys.list(params),
        queryFn: () => facilitiesAPI.getAll(params),
        staleTime: 300_000,
        placeholderData: (prev) => prev,
    });
}

/* =====================
 * GET SINGLE
 * ===================== */

export function useFacility(id?: string) {
    return useQuery<FacilityData>({
        queryKey: facilityKeys.detail(id as string),
        queryFn: () => facilitiesAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * GET CATEGORIES
 * ===================== */

export function useFacilityCategories() {
    return useQuery<string[]>({
        queryKey: facilityKeys.categories(),
        queryFn: () => facilitiesAPI.getCategories(),
        staleTime: 10 * 60 * 1000,
    });
}

/* =====================
 * CREATE
 * ===================== */

export function useCreateFacility() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: FacilityCreateRequest) => facilitiesAPI.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });
            queryClient.invalidateQueries({ queryKey: facilityKeys.categories() });
        },
        onError: (error) => console.error("Create facility error:", error),
    });
}

/* =====================
 * UPDATE
 * ===================== */

export function useUpdateFacility() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: FacilityUpdateRequest }) => facilitiesAPI.update(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: facilityKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });
        },
        onError: (error) => console.error("Update facility error:", error),
    });
}

/* =====================
 * DELETE
 * ===================== */

export function useDeleteFacility() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => facilitiesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });
        },
        onError: (error) => console.error("Delete facility error:", error),
    });
}

/* =====================
 * TOGGLE ACTIVE
 * ===================== */

export function useToggleFacility() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => facilitiesAPI.toggleActive(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: facilityKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });
        },
    });
}
