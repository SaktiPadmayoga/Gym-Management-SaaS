import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api/tenant/users";
import { UserCreateRequest, UserData, UserUpdateRequest } from "@/types/tenant/users";

export type UsersQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    role?: string;
};

/* =====================
 * QUERY KEYS
 * ===================== */

export const userKeys = {
    all: ["users"] as const,

    lists: () => [...userKeys.all, "list"] as const,

    list: (params?: UsersQueryParams) => [...userKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? "", params?.role ?? ""] as const,

    details: () => [...userKeys.all, "detail"] as const,

    detail: (id: string) => [...userKeys.details(), id] as const,
};

/* =====================
 * GET ALL USERS
 * ===================== */

export function useUsers(params?: UsersQueryParams) {
    return useQuery<UserData[]>({
        queryKey: userKeys.list(params),
        queryFn: () => usersAPI.getAll(params),
        staleTime: 300_000, // 5 minutes
        placeholderData: (prev) => prev,
    });
}

/* =====================
 * GET SINGLE USER
 * ===================== */

export function useUser(id?: string) {
    return useQuery<UserData>({
        queryKey: userKeys.detail(id as string),
        queryFn: () => usersAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * CREATE USER
 * ===================== */

export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UserCreateRequest) => usersAPI.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },

        onError: (error) => {
            console.error("Create user error:", error);
            // Anda bisa menambahkan toast notification disini
        },
    });
}

/* =====================
 * UPDATE USER
 * ===================== */

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UserUpdateRequest }) => usersAPI.update(id, payload),

        onSuccess: (data, { id }) => {
            // Update cache detail langsung jika diperlukan (Optimistic update style) atau invalidate
            queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },

        onError: (error) => {
            console.error("Update user error:", error);
        },
    });
}

/* =====================
 * DELETE USER (SOFT DELETE)
 * ===================== */

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => usersAPI.delete(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        },

        onError: (error) => {
            console.error("Delete user error:", error);
        },
    });
}
