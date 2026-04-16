import { useQuery } from "@tanstack/react-query";
import { membershipsAPI } from "@/lib/api/tenant/memberships";
import { MembershipsQueryParams } from "@/types/tenant/memberships";

export const membershipKeys = {
    all: ["memberships"] as const,
    active: (params?: MembershipsQueryParams) => ["memberships", "active", params] as const,
    history: (params?: MembershipsQueryParams) => ["memberships", "history", params] as const,
};

export function useActiveMemberships(params?: MembershipsQueryParams) {
    return useQuery({
        queryKey: membershipKeys.active(params),
        queryFn: () => membershipsAPI.getActive(params),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });
}

export function useMembershipHistory(params?: MembershipsQueryParams) {
    return useQuery({
        queryKey: membershipKeys.history(params),
        queryFn: () => membershipsAPI.getHistory(params),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });
}