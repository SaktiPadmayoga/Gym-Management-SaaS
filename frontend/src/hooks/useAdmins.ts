import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminsAPI } from "@/lib/api/admins";
import { AdminCreateRequest, AdminData, AdminUpdateRequest } from "@/types/central/admins";

export type AdminsQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
};

/* =====================
 * QUERY KEYS
 * ===================== */

export const adminKeys = {
    all: ["admins"] as const,

    lists: () => [...adminKeys.all, "list"] as const,

    list: (params?: AdminsQueryParams) =>
        [...adminKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? ""] as const,

    details: () => [...adminKeys.all, "detail"] as const,

    detail: (id: string) => [...adminKeys.details(), id] as const,
};

/* =====================
 * GET ALL ADMINS
 * ===================== */

export function useAdmins(params?: AdminsQueryParams) {
    return useQuery({
        queryKey: adminKeys.list(params),
        queryFn: () => adminsAPI.getAll(params),
        staleTime: 300_000,
        placeholderData: (prev) => prev,
    });
}

/* =====================
 * GET SINGLE ADMIN
 * ===================== */

export function useAdmin(id?: string) {
    return useQuery<AdminData>({
        queryKey: adminKeys.detail(id as string),
        queryFn: () => adminsAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * CREATE ADMIN
 * ===================== */

export function useCreateAdmin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AdminCreateRequest) => adminsAPI.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
        },

        onError: (error) => {
            console.error("Create admin error:", error);
        },
    });
}

/* =====================
 * UPDATE ADMIN
 * ===================== */

export function useUpdateAdmin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: AdminUpdateRequest }) =>
            adminsAPI.update(id, payload),

        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
        },

        onError: (error) => {
            console.error("Update admin error:", error);
        },
    });
}

/* =====================
 * DELETE ADMIN (SOFT DELETE)
 * ===================== */

export function useDeleteAdmin() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => adminsAPI.delete(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
        },

        onError: (error) => {
            console.error("Delete admin error:", error);
        },
    });
}