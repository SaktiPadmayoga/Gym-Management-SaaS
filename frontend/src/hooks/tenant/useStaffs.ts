import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { staffAPI } from "@/lib/api/tenant/staffs";
import { AssignBranchRequest, StaffCreateRequest, StaffData, StaffUpdateRequest } from "@/types/tenant/staffs";

export type StaffQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    branch_id?: string;
    role?: string;
    is_active?: boolean;
};

/* =====================
 * QUERY KEYS
 * ===================== */

export const staffKeys = {
    all: ["staff"] as const,

    lists: () => [...staffKeys.all, "list"] as const,

    list: (params?: StaffQueryParams) => [...staffKeys.lists(), params?.page ?? 1, params?.per_page ?? 15, params?.search ?? "", params?.branch_id ?? "", params?.role ?? ""] as const,

    details: () => [...staffKeys.all, "detail"] as const,

    detail: (id: string) => [...staffKeys.details(), id] as const,

    branches: (id: string) => [...staffKeys.all, "branches", id] as const,
};

/* =====================
 * GET ALL STAFF
 * ===================== */

export function useStaff(params?: StaffQueryParams) {
    return useQuery({
        queryKey: staffKeys.list(params),
        queryFn: () => staffAPI.getAll(params),
        staleTime: 300_000,
        placeholderData: (prev) => prev,
    });
}

/* =====================
 * GET SINGLE STAFF
 * ===================== */

export function useStaffDetail(id?: string) {
    return useQuery<StaffData>({
        queryKey: staffKeys.detail(id as string),
        queryFn: () => staffAPI.getById(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * GET STAFF BRANCHES
 * ===================== */

export function useStaffBranches(id?: string) {
    return useQuery({
        queryKey: staffKeys.branches(id as string),
        queryFn: () => staffAPI.getBranches(id as string),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

/* =====================
 * CREATE STAFF
 * ===================== */

export function useCreateStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: StaffCreateRequest) => staffAPI.create(payload),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
        },

        onError: (error) => {
            console.error("Create staff error:", error);
        },
    });
}

/* =====================
 * UPDATE STAFF
 * ===================== */

export function useUpdateStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: StaffUpdateRequest }) => staffAPI.update(id, payload),

        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
        },

        onError: (error) => {
            console.error("Update staff error:", error);
        },
    });
}

/* =====================
 * DELETE STAFF
 * ===================== */

export function useDeleteStaff() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => staffAPI.delete(id),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
        },

        onError: (error) => {
            console.error("Delete staff error:", error);
        },
    });
}

/* =====================
 * ASSIGN BRANCH
 * ===================== */

export function useAssignBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ staffId, payload }: { staffId: string; payload: AssignBranchRequest }) => staffAPI.assignBranch(staffId, payload),

        onSuccess: (_, { staffId }) => {
            queryClient.invalidateQueries({
                queryKey: staffKeys.branches(staffId),
            });
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
        },
    });
}

/* =====================
 * REVOKE BRANCH
 * ===================== */

export function useRevokeBranch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ staffId, branchId }: { staffId: string; branchId: string }) => staffAPI.revokeBranch(staffId, branchId),

        onSuccess: (_, { staffId }) => {
            queryClient.invalidateQueries({
                queryKey: staffKeys.branches(staffId),
            });
            queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
        },
    });
}
