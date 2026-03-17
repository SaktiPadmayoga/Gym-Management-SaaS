import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { membersAPI } from "@/lib/api/tenant/members";
import {
    AssignMemberBranchRequest,
    MemberCreateRequest,
    MemberData,
    MemberUpdateRequest,
    UpdateMembershipRequest,
} from "@/types/tenant/members";

export type MembersQueryParams = {
    page?:             number;
    per_page?:         number;
    search?:           string;
    status?:           string;
    gender?:           string;
    is_active?:        boolean;
    expiring_in_days?: number;
};

/* =====================
 * QUERY KEYS
 * ===================== */

export const memberKeys = {
    all:      ["members"] as const,
    lists:    () => [...memberKeys.all, "list"] as const,
    list:     (params?: MembersQueryParams) =>
        [...memberKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? "", params?.status ?? ""] as const,
    details:  () => [...memberKeys.all, "detail"] as const,
    detail:   (id: string) => [...memberKeys.details(), id] as const,
    branches: (id: string) => [...memberKeys.all, "branches", id] as const,
};

/* =====================
 * GET ALL
 * ===================== */

export function useMembers(params?: MembersQueryParams) {
    return useQuery({
        queryKey: memberKeys.list(params),
        queryFn:  () => membersAPI.getAll(params),
        staleTime: 300_000,
        placeholderData: (prev) => prev,
    });
}

/* =====================
 * GET SINGLE
 * ===================== */

export function useMember(id?: string) {
    return useQuery<MemberData>({
        queryKey: memberKeys.detail(id as string),
        queryFn:  () => membersAPI.getById(id as string),
        enabled:  !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * GET MEMBER BRANCHES
 * ===================== */

export function useMemberBranches(id?: string) {
    return useQuery({
        queryKey: memberKeys.branches(id as string),
        queryFn:  () => membersAPI.getBranches(id as string),
        enabled:  !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * CREATE
 * ===================== */

export function useCreateMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: MemberCreateRequest) => membersAPI.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
        onError: (error) => {
            console.error("Create member error:", error);
        },
    });
}

/* =====================
 * UPDATE
 * ===================== */

export function useUpdateMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: MemberUpdateRequest }) =>
            membersAPI.update(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
        onError: (error) => {
            console.error("Update member error:", error);
        },
    });
}

/* =====================
 * DELETE
 * ===================== */

export function useDeleteMember() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => membersAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
        onError: (error) => {
            console.error("Delete member error:", error);
        },
    });
}

/* =====================
 * ASSIGN BRANCH
 * ===================== */

export function useAssignMemberBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberId, payload }: { memberId: string; payload: AssignMemberBranchRequest }) =>
            membersAPI.assignBranch(memberId, payload),
        onSuccess: (_, { memberId }) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.branches(memberId) });
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
    });
}

/* =====================
 * UPDATE MEMBERSHIP
 * ===================== */

export function useUpdateMembership() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            memberId,
            branchId,
            payload,
        }: {
            memberId: string;
            branchId: string;
            payload: UpdateMembershipRequest;
        }) => membersAPI.updateMembership(memberId, branchId, payload),
        onSuccess: (_, { memberId }) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.detail(memberId) });
            queryClient.invalidateQueries({ queryKey: memberKeys.branches(memberId) });
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
    });
}

/* =====================
 * REVOKE BRANCH
 * ===================== */

export function useRevokeMemberBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ memberId, branchId }: { memberId: string; branchId: string }) =>
            membersAPI.revokeBranch(memberId, branchId),
        onSuccess: (_, { memberId }) => {
            queryClient.invalidateQueries({ queryKey: memberKeys.branches(memberId) });
            queryClient.invalidateQueries({ queryKey: memberKeys.lists() });
        },
    });
}