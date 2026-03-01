import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { domainRequestsAPI, DomainRequestQueryParams } from "@/lib/api/domainRequests";
import { CreateDomainRequest } from "@/types/central/domain-requests";

export const domainRequestKeys = {
    all: ["domain-requests"] as const,
    lists: () => [...domainRequestKeys.all, "list"] as const,
    list: (params?: DomainRequestQueryParams) => [...domainRequestKeys.lists(), params] as const,
    details: () => [...domainRequestKeys.all, "detail"] as const,
    detail: (id: string) => [...domainRequestKeys.details(), id] as const,
};

// Tenant
export function useMyDomainRequests(params?: DomainRequestQueryParams) {
    return useQuery({
        queryKey: [...domainRequestKeys.lists(), "my", params],
        queryFn: () => domainRequestsAPI.getMyRequests(params),
        staleTime: 60_000,
    });
}

export function useCreateDomainRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateDomainRequest) => domainRequestsAPI.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: domainRequestKeys.lists() });
        },
        onError: (error) => {
            console.error("Create domain request error:", error);
        },
    });
}

export function useCancelDomainRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => domainRequestsAPI.cancel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: domainRequestKeys.lists() });
        },
        onError: (error) => {
            console.error("Cancel domain request error:", error);
        },
    });
}

// Admin
export function useDomainRequests(params?: DomainRequestQueryParams) {
    return useQuery({
        queryKey: domainRequestKeys.list(params),
        queryFn: () => domainRequestsAPI.getAll(params),
        staleTime: 30_000,
    });
}

export function useReviewDomainRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: { action: "approve" | "reject"; rejection_reason?: string } }) =>
            domainRequestsAPI.review(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: domainRequestKeys.lists() });
        },
        onError: (error) => {
            console.error("Review domain request error:", error);
        },
    });
}