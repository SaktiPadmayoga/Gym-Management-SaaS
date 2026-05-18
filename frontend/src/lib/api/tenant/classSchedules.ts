import tenantApiClient from "@/lib/tenant-api-client";
import memberApiClient from "@/lib/member-api-client";
import {
    ClassAttendanceData,
    ClassScheduleCreateRequest,
    ClassScheduleData,
    ClassScheduleUpdateRequest,
} from "@/types/tenant/class-schedules";

export const classSchedulesAPI = {
    // =============================================
    // STAFF
    // =============================================

    getAll: async (params?: {
        page?: number;
        per_page?: number;
        date?: string;
        date_from?: string;
        date_to?: string;
        status?: string;
        class_plan_id?: string;
        instructor_id?: string;
    }): Promise<{ data: ClassScheduleData[]; meta: any }> => {
        const response = await tenantApiClient.get("/class-schedules", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                ...(params?.date && { date: params.date }),
                ...(params?.date_from && { date_from: params.date_from }),
                ...(params?.date_to && { date_to: params.date_to }),
                ...(params?.status && { status: params.status }),
                ...(params?.class_plan_id && { class_plan_id: params.class_plan_id }),
                ...(params?.instructor_id && { instructor_id: params.instructor_id }),
            },
        });
        return {
            data: response.data.data.data ?? [],
            meta: response.data.data.meta ?? null,
        };
    },

    getById: async (id: string): Promise<ClassScheduleData> => {
        const response = await tenantApiClient.get(`/class-schedules/${id}`);
        return response.data.data;
    },

    create: async (payload: ClassScheduleCreateRequest): Promise<ClassScheduleData> => {
        const response = await tenantApiClient.post("/class-schedules", payload);
        return response.data.data;
    },

    update: async (id: string, payload: ClassScheduleUpdateRequest): Promise<ClassScheduleData> => {
        const response = await tenantApiClient.put(`/class-schedules/${id}`, payload);
        return response.data.data;
    },

    delete: async (id: string): Promise<void> => {
        await tenantApiClient.delete(`/class-schedules/${id}`);
    },

    cancel: async (id: string, reason?: string): Promise<ClassScheduleData> => {
        const response = await tenantApiClient.patch(`/class-schedules/${id}/cancel`, {
            cancelled_reason: reason,
        });
        return response.data.data;
    },

    // Attendance - Staff
    getAttendances: async (scheduleId: string): Promise<ClassAttendanceData[]> => {
        const response = await tenantApiClient.get(`/class-schedules/${scheduleId}/attendances`);
        return response.data.data ?? [];
    },

    addAttendance: async (scheduleId: string, memberId: string, notes?: string): Promise<ClassAttendanceData> => {
        const response = await tenantApiClient.post(`/class-schedules/${scheduleId}/attendances`, {
            member_id: memberId,
            notes,
        });
        return response.data.data;
    },

    markAttended: async (scheduleId: string, attendanceId: string): Promise<ClassAttendanceData> => {
        const response = await tenantApiClient.patch(
            `/class-schedules/${scheduleId}/attendances/${attendanceId}/checkin`
        );
        return response.data.data;
    },

    cancelAttendance: async (scheduleId: string, attendanceId: string): Promise<void> => {
        await tenantApiClient.patch(
            `/class-schedules/${scheduleId}/attendances/${attendanceId}/cancel`
        );
    },

    // =============================================
    // MEMBER
    // =============================================

    memberGetAll: async (params?: {
        page?: number;
        per_page?: number;
        date?: string;
        class_plan_id?: string;
    }): Promise<{ data: ClassScheduleData[]; meta: any }> => {
        const response = await memberApiClient.get("/member/class-schedules", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                ...(params?.date && { date: params.date }),
                ...(params?.class_plan_id && { class_plan_id: params.class_plan_id }),
            },
        });

        // ✅ PERBAIKAN: Normalise response structure dari Laravel pagination.
        // Backend ApiResponse membungkus data dalam { data: { data: [...], meta: {} } }
        // Tapi beberapa controller mungkin langsung return array tanpa pagination.
        const payload = response.data?.data;

        // Case 1: Ada pagination → { data: [...], meta: {} }
        if (payload && Array.isArray(payload.data)) {
            return {
                data: payload.data,
                meta: payload.meta ?? null,
            };
        }

        // Case 2: Langsung array (tanpa pagination)
        if (Array.isArray(payload)) {
            return { data: payload, meta: null };
        }

        // Fallback: kosong
        return { data: [], meta: null };
    },

    /**
     * Booking Kelas oleh Member
     * ✅ PERBAIKAN: Return { data: { attendance, invoice, snap_token } }
     * yang konsisten antara kelas gratis dan berbayar.
     */
    memberBook: async (scheduleId: string): Promise<{
        attendance: ClassAttendanceData;
        invoice: { id: string; invoice_number: string; total_amount: number; due_date: string } | null;
        snap_token: string | null;
    }> => {
        const response = await memberApiClient.post(`/member/class-schedules/${scheduleId}/book-v2`);
        // Backend ApiResponse.success() membungkus dalam { success, message, data: {...} }
        // Jadi response.data.data = { attendance, invoice, snap_token }
        return response.data.data;
    },

    memberCancelBook: async (scheduleId: string): Promise<void> => {
        await memberApiClient.delete(`/member/class-schedules/${scheduleId}/book-v2`);
    },

    memberMyClasses: async (params?: {
        page?: number;
        per_page?: number;
        status?: string;
    }): Promise<{ data: ClassAttendanceData[]; meta: any }> => {
        const response = await memberApiClient.get("/member/my-classes", {
            params: {
                page: params?.page || 1,
                per_page: params?.per_page || 15,
                ...(params?.status && { status: params.status }),
            },
        });

        const payload = response.data?.data;

        if (payload && Array.isArray(payload.data)) {
            return {
                data: payload.data,
                meta: payload.meta ?? null,
            };
        }

        if (Array.isArray(payload)) {
            return { data: payload, meta: null };
        }

        return { data: [], meta: null };
    },
};