
import * as z from "zod";

export const ClassScheduleStatusEnum = z.enum(["scheduled", "ongoing", "completed", "cancelled"]);
export const ClassTypeEnum = z.enum(["membership_only", "public", "private"]);
export const AttendanceStatusEnum = z.enum(["booked", "attended", "cancelled", "no_show"]);

export const ClassAttendanceSchema = z.object({
    id: z.string(),
    class_schedule_id: z.string(),
    status: AttendanceStatusEnum,
    booked_at: z.string().nullable().optional(),
    attended_at: z.string().nullable().optional(),
    cancelled_at: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    member: z.object({
        id: z.string(),
        name: z.string(),
        phone: z.string().nullable().optional(),
        avatar: z.string().nullable().optional(),
    }).optional(),
    checked_in_by: z.object({
        id: z.string(),
        name: z.string(),
    }).nullable().optional(),
    schedule: z.object({
        id: z.string(),
        date: z.string(),
        start_at: z.string(),
        end_at: z.string(),
    }).optional(),
});

export const ClassScheduleSchema = z.object({
    id: z.string(),
    date: z.string(),
    start_at: z.string(),
    end_at: z.string(),
    status: ClassScheduleStatusEnum,
    class_type: ClassTypeEnum,
    max_capacity: z.number().nullable().optional(),
    available_slots: z.number().nullable().optional(),
    total_booked: z.number().default(0),
    total_attended: z.number().default(0),
    cancelled_reason: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    is_full: z.boolean().optional(),
    is_bookable: z.boolean().optional(),
    is_booked_by_me: z.boolean().optional(),
    class_plan: z.object({
        id: z.string(),
        name: z.string(),
        category: z.string().nullable().optional(),
        color: z.string().nullable().optional(),
        minutes_per_session: z.number(),
        duration_label: z.string().optional(),
        price: z.number().nullable().optional(),
    }).optional(),
    instructor: z.object({
        id: z.string(),
        name: z.string(),
    }).optional(),
    branch: z.object({
        id: z.string(),
        name: z.string(),
    }).optional(),
    attendances: z.array(ClassAttendanceSchema).optional(),
    price: z.number().nullable().optional(),
    created_at: z.string().optional(),
});

export type ClassScheduleData = z.infer<typeof ClassScheduleSchema>;
export type ClassAttendanceData = z.infer<typeof ClassAttendanceSchema>;
export type ClassScheduleDataWithKeyword = ClassScheduleData & { search: string };

export const ClassScheduleCreateRequestSchema = z.object({
    class_plan_id: z.string().min(1, "Pilih kelas"),
    instructor_id: z.string().min(1, "Pilih instruktur"),
    date: z.string().min(1, "Pilih tanggal"),
    start_at: z.string().min(1, "Isi jam mulai"),
    end_at: z.string().min(1, "Isi jam selesai"),
    class_type: ClassTypeEnum.optional(),
    max_capacity: z.number().optional(),
    notes: z.string().optional(),
});

export type ClassScheduleCreateRequest = z.infer<typeof ClassScheduleCreateRequestSchema>;
export type ClassScheduleUpdateRequest = Partial<ClassScheduleCreateRequest> & {
    status?: z.infer<typeof ClassScheduleStatusEnum>;
    cancelled_reason?: string;
};

export type ClassScheduleQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    date?: string;
    date_from?: string;
    date_to?: string;
    status?: string;
    class_plan_id?: string;
    instructor_id?: string;
};

export type MemberBookResponse = {
    data: {
        attendance?: any;
        invoice?: {
            id: string;
            invoice_number: string;
            total_amount: number;
            due_date: string;
        };
        snap_token?: string;
    };
    message?: string;
};