import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantUsersAPI } from "@/lib/api/tenant/tenantUsers";
import {
    TenantUserCreateRequest,
    TenantUserData,
    TenantUserUpdateRequest,
} from "@/types/tenant/tenant-users";

export type TenantUsersQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
};

/* =====================
 * QUERY KEYS
 * ===================== */

export const tenantUserKeys = {
    all: ["tenant-users"] as const,

    lists: () => [...tenantUserKeys.all, "list"] as const,

    list: (params?: TenantUsersQueryParams) =>
        [...tenantUserKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? ""] as const,

    details: () => [...tenantUserKeys.all, "detail"] as const,

    detail: (id: string) => [...tenantUserKeys.details(), id] as const,
};

/* =====================
 * GET ALL USERS
 * ===================== */

export function useTenantUsers(params?: TenantUsersQueryParams) {
    return useQuery<TenantUserData[]>({
        queryKey: tenantUserKeys.list(params),
        queryFn: () => tenantUsersAPI.getAll(params),
        staleTime: 300_000,
        placeholderData: (prev) => prev,
    });
}

/* =====================
 * GET SINGLE USER
 * ===================== */

export function useTenantUser(id?: string) {
    return useQuery<TenantUserData>({
        queryKey: tenantUserKeys.detail(id as string),
        queryFn: () => tenantUsersAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * CREATE USER
 * ===================== */

export function useCreateTenantUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: TenantUserCreateRequest) => tenantUsersAPI.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantUserKeys.lists() });
        },

        onError: (error) => {
            console.error("Create tenant user error:", error);
        },
    });
}

/* =====================
 * UPDATE USER
 * ===================== */

export function useUpdateTenantUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: TenantUserUpdateRequest }) =>
            tenantUsersAPI.update(id, payload),

        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: tenantUserKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: tenantUserKeys.lists() });
        },

        onError: (error) => {
            console.error("Update tenant user error:", error);
        },
    });
}

/* =====================
 * DELETE USER (SOFT DELETE)
 * ===================== */

export function useDeleteTenantUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => tenantUsersAPI.delete(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantUserKeys.lists() });
        },

        onError: (error) => {
            console.error("Delete tenant user error:", error);
        },
    });
}