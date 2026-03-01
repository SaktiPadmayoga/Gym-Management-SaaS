import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { accountsAPI } from "@/lib/api/accounts";
import { AccountCreateRequest, AccountData, AccountUpdateRequest } from "@/types/central/accounts";

export type AccountsQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
};

/* =====================
 * QUERY KEYS
 * ===================== */

export const accountKeys = {
    all: ["accounts"] as const,

    lists: () => [...accountKeys.all, "list"] as const,

    list: (params?: AccountsQueryParams) => [...accountKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? ""] as const,

    details: () => [...accountKeys.all, "detail"] as const,

    detail: (id: string) => [...accountKeys.details(), id] as const,
};

/* =====================
 * GET ALL ACCOUNTS
 * ===================== */

export function useAccounts(params?: AccountsQueryParams) {
    return useQuery<AccountData[]>({
        queryKey: accountKeys.list(params),
        queryFn: () => accountsAPI.getAll(params),
        staleTime: 300_000,
        placeholderData: (prev) => prev,
    });
}

/* =====================
 * GET SINGLE ACCOUNT
 * ===================== */

export function useAccount(id?: string) {
    return useQuery<AccountData>({
        queryKey: accountKeys.detail(id as string),
        queryFn: () => accountsAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * CREATE ACCOUNT
 * ===================== */

export function useCreateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: AccountCreateRequest) => accountsAPI.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
        },

        onError: (error) => {
            console.error("Create account error:", error);
        },
    });
}

/* =====================
 * UPDATE ACCOUNT
 * ===================== */

export function useUpdateAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: AccountUpdateRequest }) => accountsAPI.update(id, payload),

        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: accountKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
        },

        onError: (error) => {
            console.error("Update account error:", error);
        },
    });
}

/* =====================
 * DELETE ACCOUNT (SOFT DELETE)
 * ===================== */

export function useDeleteAccount() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => accountsAPI.delete(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: accountKeys.lists() });
        },

        onError: (error) => {
            console.error("Delete account error:", error);
        },
    });
}
