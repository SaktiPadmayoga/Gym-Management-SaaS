import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantBranchesAPI } from "@/lib/api/tenantBranches";
import {
    TenantBranchCreateRequest,
    TenantBranchData,
    TenantBranchPaginatedResponse,
    TenantBranchUpdateRequest,
} from "@/types/central/tenant-branches";

export type TenantBranchesQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    tenant_id?: string;
    is_active?: boolean;
};

/* =====================================================
 * QUERY KEYS
 * ===================================================== */
export const tenantBranchKeys = {
    all: ["tenant-branches"] as const,
    lists: () => [...tenantBranchKeys.all, "list"] as const,
    list: (params?: TenantBranchesQueryParams) => [...tenantBranchKeys.lists(), params] as const,
    details: () => [...tenantBranchKeys.all, "detail"] as const,
    detail: (id: string) => [...tenantBranchKeys.details(), id] as const,
};

/* =====================================================
 * GET ALL TENANT BRANCHES
 * ===================================================== */
export function useTenantBranches(params?: TenantBranchesQueryParams) {
    return useQuery<TenantBranchPaginatedResponse>({
        queryKey: tenantBranchKeys.list(params),
        queryFn: () => tenantBranchesAPI.getAll(params),
        placeholderData: (prev) => prev,
        staleTime: 300_000,
    });
}

/* =====================================================
 * GET SINGLE TENANT BRANCH
 * ===================================================== */
export function useTenantBranch(id?: string) {
    return useQuery<TenantBranchData>({
        queryKey: tenantBranchKeys.detail(id as string),
        queryFn: () => tenantBranchesAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================================================
 * CREATE TENANT BRANCH
 * ===================================================== */
export function useCreateTenantBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: TenantBranchCreateRequest) => tenantBranchesAPI.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantBranchKeys.lists() });
        },
        onError: (error) => {
            console.error("Create tenant branch error:", error);
        },
    });
}

/* =====================================================
 * UPDATE TENANT BRANCH
 * ===================================================== */
export function useUpdateTenantBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: TenantBranchUpdateRequest }) =>
            tenantBranchesAPI.update(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: tenantBranchKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: tenantBranchKeys.lists() });
        },
        onError: (error) => {
            console.error("Update tenant branch error:", error);
        },
    });
}

/* =====================================================
 * DELETE TENANT BRANCH
 * ===================================================== */
export function useDeleteTenantBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tenantBranchesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantBranchKeys.lists() });
        },
        onError: (error) => {
            console.error("Delete tenant branch error:", error);
        },
    });
}

/* =====================================================
 * RESTORE TENANT BRANCH
 * ===================================================== */
export function useRestoreTenantBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tenantBranchesAPI.restore(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantBranchKeys.lists() });
        },
        onError: (error) => {
            console.error("Restore tenant branch error:", error);
        },
    });
}

/* =====================================================
 * TOGGLE ACTIVE TENANT BRANCH
 * ===================================================== */
export function useToggleActiveTenantBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tenantBranchesAPI.toggleActive(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: tenantBranchKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: tenantBranchKeys.lists() });
        },
        onError: (error) => {
            console.error("Toggle active tenant branch error:", error);
        },
    });
}
