"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantsAPI } from "@/lib/api/tenants";
import { TenantCreateRequest, TenantsData } from "@/types/central/tenants";
import { TenantsPaginatedResponse } from "@/types/central/tenants";


export type TenantsQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    plan_id?: string;
};

/* =====================================================
 * QUERY KEYS
 * ===================================================== */
export const tenantKeys = {
    all: ["tenants"] as const,
    lists: () => [...tenantKeys.all, "list"] as const,
    list: (params?: TenantsQueryParams) => [...tenantKeys.lists(), params] as const,
    details: () => [...tenantKeys.all, "detail"] as const,
    detail: (id: string) => [...tenantKeys.details(), id] as const,
};

/* =====================================================
 * GET ALL TENANTS
 * ===================================================== */
export function useTenants(params?: TenantsQueryParams) {
    return useQuery<TenantsPaginatedResponse>({
        queryKey: ["tenants", params],
        queryFn: () => tenantsAPI.getAll(params),
        staleTime: 300000,
    });
}
/* =====================================================
 * GET SINGLE TENANT
 * ===================================================== */
export function useTenant(id?: string) {
    return useQuery<TenantsData>({
        queryKey: tenantKeys.detail(id as string),
        queryFn: () => tenantsAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================================================
 * CREATE TENANT
 * ===================================================== */
export function useCreateTenant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: TenantCreateRequest) => tenantsAPI.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
        },
        onError: (error) => {
            console.error("Create tenant error:", error);
        },
    });
}

/* =====================================================
 * UPDATE TENANT
 * ===================================================== */
export function useUpdateTenant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<TenantCreateRequest> }) => tenantsAPI.update(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
        },
        onError: (error) => {
            console.error("Update tenant error:", error);
        },
    });
}

/* =====================================================
 * DELETE TENANT
 * ===================================================== */
export function useDeleteTenant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tenantsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
        },
        onError: (error) => {
            console.error("Delete tenant error:", error);
        },
    });
}

/* =====================================================
 * RESTORE TENANT
 * ===================================================== */
export function useRestoreTenant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tenantsAPI.restore(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
        },
        onError: (error) => {
            console.error("Restore tenant error:", error);
        },
    });
}
