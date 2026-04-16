import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classSchedulesAPI } from "@/lib/api/tenant/classSchedules";
import {
    ClassScheduleCreateRequest,
    ClassScheduleQueryParams,
    ClassScheduleUpdateRequest,
} from "@/types/tenant/class-schedules";

export const classScheduleKeys = {
    all: ["class-schedules"] as const,
    lists: () => [...classScheduleKeys.all, "list"] as const,
    list: (params?: ClassScheduleQueryParams) => [...classScheduleKeys.lists(), params] as const,
    details: () => [...classScheduleKeys.all, "detail"] as const,
    detail: (id: string) => [...classScheduleKeys.details(), id] as const,
    attendances: (id: string) => [...classScheduleKeys.all, "attendances", id] as const,
    memberList: (params?: any) => ["member-class-schedules", "list", params] as const,
    memberMyClasses: (params?: any) => ["member-my-classes", params] as const,
};

// =============================================
// STAFF QUERIES
// =============================================

export function useClassSchedules(params?: ClassScheduleQueryParams) {
    return useQuery({
        queryKey: classScheduleKeys.list(params),
        queryFn: () => classSchedulesAPI.getAll(params),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });
}

export function useClassSchedule(id?: string) {
    return useQuery({
        queryKey: classScheduleKeys.detail(id as string),
        queryFn: () => classSchedulesAPI.getById(id as string),
        enabled: !!id,
        staleTime: 30_000,
    });
}

export function useClassScheduleAttendances(scheduleId?: string) {
    return useQuery({
        queryKey: classScheduleKeys.attendances(scheduleId as string),
        queryFn: () => classSchedulesAPI.getAttendances(scheduleId as string),
        enabled: !!scheduleId,
        staleTime: 15_000,
    });
}

// =============================================
// STAFF MUTATIONS
// =============================================

export function useCreateClassSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: ClassScheduleCreateRequest) =>
            classSchedulesAPI.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: classScheduleKeys.lists() });
        },
    });
}

export function useUpdateClassSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: ClassScheduleUpdateRequest }) =>
            classSchedulesAPI.update(id, payload),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: classScheduleKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: classScheduleKeys.lists() });
        },
    });
}

export function useDeleteClassSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => classSchedulesAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: classScheduleKeys.lists() });
        },
    });
}

export function useCancelClassSchedule() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
            classSchedulesAPI.cancel(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: classScheduleKeys.detail(id) });
            queryClient.invalidateQueries({ queryKey: classScheduleKeys.lists() });
        },
    });
}

export function useAddAttendance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ scheduleId, memberId, notes }: { scheduleId: string; memberId: string; notes?: string }) =>
            classSchedulesAPI.addAttendance(scheduleId, memberId, notes),
        onSuccess: (_, { scheduleId }) => {
            queryClient.invalidateQueries({ queryKey: classScheduleKeys.attendances(scheduleId) });
            queryClient.invalidateQueries({ queryKey: classScheduleKeys.detail(scheduleId) });
        },
    });
}

export function useMarkAttended() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ scheduleId, attendanceId }: { scheduleId: string; attendanceId: string }) =>
            classSchedulesAPI.markAttended(scheduleId, attendanceId),
        onSuccess: (_, { scheduleId }) => {
            queryClient.invalidateQueries({ queryKey: classScheduleKeys.attendances(scheduleId) });
            queryClient.invalidateQueries({ queryKey: classScheduleKeys.detail(scheduleId) });
        },
    });
}

export function useCancelAttendance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ scheduleId, attendanceId }: { scheduleId: string; attendanceId: string }) =>
            classSchedulesAPI.cancelAttendance(scheduleId, attendanceId),
        onSuccess: (_, { scheduleId }) => {
            queryClient.invalidateQueries({ queryKey: classScheduleKeys.attendances(scheduleId) });
            queryClient.invalidateQueries({ queryKey: classScheduleKeys.detail(scheduleId) });
        },
    });
}

// =============================================
// MEMBER QUERIES & MUTATIONS
// =============================================

export function useMemberClassSchedules(params?: {
    page?: number;
    per_page?: number;
    date?: string;
    class_plan_id?: string;
}) {
    return useQuery({
        queryKey: classScheduleKeys.memberList(params),
        queryFn: () => classSchedulesAPI.memberGetAll(params),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });
}

export function useMyClasses(params?: { page?: number; per_page?: number; status?: string }) {
    return useQuery({
        queryKey: classScheduleKeys.memberMyClasses(params),
        queryFn: () => classSchedulesAPI.memberMyClasses(params),
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });
}

export function useMemberBookClass() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (scheduleId: string) => classSchedulesAPI.memberBook(scheduleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["member-class-schedules"] });
            queryClient.invalidateQueries({ queryKey: ["member-my-classes"] });
        },
    });
}

export function useMemberCancelBook() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (scheduleId: string) => classSchedulesAPI.memberCancelBook(scheduleId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["member-class-schedules"] });
            queryClient.invalidateQueries({ queryKey: ["member-my-classes"] });
        },
    });
}