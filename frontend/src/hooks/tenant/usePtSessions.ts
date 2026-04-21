import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ptSessionsAPI } from "@/lib/api/tenant/ptSessions";
import {
    PtSessionCreateRequest,
    PtSessionQueryParams,
    PtSessionUpdateRequest,
} from "@/types/tenant/pt";

export const ptSessionKeys = {
    all: ["pt-sessions"] as const,
    lists: () => [...ptSessionKeys.all, "list"] as const,
    list: (params?: PtSessionQueryParams) => [...ptSessionKeys.lists(), params] as const,
    details: () => [...ptSessionKeys.all, "detail"] as const,
    detail: (id: string) => [...ptSessionKeys.details(), id] as const,
};

// =============================================
// QUERIES
// =============================================

export function usePtSessions(params?: PtSessionQueryParams) {
    return useQuery({
        queryKey: ptSessionKeys.list(params),
        queryFn: () => ptSessionsAPI.getAll(params),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });
}

export function usePtSession(id?: string) {
    return useQuery({
        queryKey: ptSessionKeys.detail(id as string),
        queryFn: () => ptSessionsAPI.getById(id as string),
        enabled: !!id,
        staleTime: 30_000,
    });
}

// =============================================
// MUTATIONS
// =============================================

export function useCreatePtSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: PtSessionCreateRequest) => ptSessionsAPI.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ptSessionKeys.lists() });
        },
    });
}

export function useUpdatePtSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: PtSessionUpdateRequest }) =>
            ptSessionsAPI.update(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ptSessionKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: ptSessionKeys.lists() });
        },
    });
}

export function useCancelPtSession() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
            ptSessionsAPI.cancel(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: ptSessionKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: ptSessionKeys.lists() });
        },
    });
}