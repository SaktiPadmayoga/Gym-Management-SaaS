import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { membersAPI } from "@/lib/api/tenant/members";
import { AssignMembershipRequest, MemberCreateRequest, MemberData, MemberUpdateRequest, UpdateMembershipRequest } from "@/types/tenant/members";

export type MembersQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    is_active?: boolean;
    home_branch_id?: string;
};

/* =====================
 * QUERY KEYS
 * ===================== */

export const memberKeys = {
    all: ["members"] as const,
    lists: () => [...memberKeys.all, "list"] as const,
    list: (params?: MembersQueryParams) => [...memberKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? "", params?.status ?? "", params?.home_branch_id ?? ""] as const,
    details: () => [...memberKeys.all, "detail"] as const,
    detail: (id: string) => [...memberKeys.details(), id] as const,
    memberships: (id: string) => [...memberKeys.all, "memberships", id] as const,
};

/* =====================
 * GET ALL & SINGLE
 * ===================== */

export function useMembers(params?: MembersQueryParams) {
    return useQuery({
        queryKey: memberKeys.list(params),
        queryFn: () => membersAPI.getAll(params),
        staleTime: 300_000,
        placeholderData: (prev) => prev,
    });
}

export function useMember(id?: string) {
    return useQuery<MemberData>({
        queryKey: memberKeys.detail(id as string),
        queryFn: () => membersAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useMemberMemberships(id?: string) {
    return useQuery({
        queryKey: memberKeys.memberships(id as string),
        queryFn: () => membersAPI.getMemberships(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * MUTATIONS
 * ===================== */

export function useCreateMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: MemberCreateRequest | FormData) => membersAPI.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
    });
}

export function useUpdateMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: MemberUpdateRequest | FormData }) => membersAPI.update(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
    });
}

export function useDeleteMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => membersAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
    });
}

/* =====================
 * MEMBERSHIP MUTATIONS
 * ===================== */

export function useAssignMembership() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberId, payload }: { memberId: string; payload: AssignMembershipRequest }) => membersAPI.assignMembership(memberId, payload),
        onSuccess: (_, { memberId }) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.memberships(memberId) });
            queryClient.invalidateQueries({ queryKey: memberKeys.detail(memberId) });
        },
    });
}

export function useUpdateMembership() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberId, membershipId, payload }: { memberId: string; membershipId: string; payload: UpdateMembershipRequest }) => membersAPI.updateMembership(memberId, membershipId, payload),
        onSuccess: (_, { memberId }) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.memberships(memberId) });
            queryClient.invalidateQueries({ queryKey: memberKeys.detail(memberId) });
        },
    });
}

export function useCancelMembership() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberId, membershipId }: { memberId: string; membershipId: string }) => membersAPI.cancelMembership(memberId, membershipId),
        onSuccess: (_, { memberId }) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.memberships(memberId) });
            queryClient.invalidateQueries({ queryKey: memberKeys.detail(memberId) });
        },
    });
}
