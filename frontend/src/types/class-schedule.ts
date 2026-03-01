import * as z from "zod";

export const ClassScheduleSchema = z.object({
    id: z.string(),

    planId: z.string(), // Plan *
    instructorId: z.string(), // Instructor *

    date: z.string(), // Date * (YYYY-MM-DD)
    startAt: z.string(), // Start At * (HH:mm)

    classType: z.enum(["Membership Only", "Public", "Private"]), // Class Type *

    access: z.enum(["PUBLIC", "PRIVATE", "MEMBER_ONLY"]), // Access *

    totalManualCheckin: z.number().min(0).default(0),

    note: z.string().optional(),

    status: z.enum(["Scheduled", "Cancelled", "Completed"]).default("Scheduled"),

    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export type ClassScheduleData = z.infer<typeof ClassScheduleSchema>;
