import { ClassScheduleData } from "@/types/class-schedule";

export const DUMMY_CLASS_SCHEDULES: ClassScheduleData[] = [
    {
        id: "CLS-001",

        planId: "CP-001",
        instructorId: "PROFILE-001",

        date: "2026-01-05",
        startAt: "09:00",

        classType: "Membership Only",
        access: "PUBLIC",

        totalManualCheckin: 0,

        note: "Morning yoga class",

        status: "Scheduled",
        createdAt: "2026-01-01T08:00:00Z",
        updatedAt: "2026-01-01T08:00:00Z",
    },
    {
        id: "CLS-002",

        planId: "CP-002",
        instructorId: "PROFILE-002",

        date: "2026-01-06",
        startAt: "18:30",

        classType: "Membership Only",
        access: "MEMBER_ONLY",

        totalManualCheckin: 5,

        note: "Evening HIIT session",

        status: "Scheduled",
        createdAt: "2026-01-02T10:15:00Z",
        updatedAt: "2026-01-02T10:15:00Z",
    },
    {
        id: "CLS-003",

        planId: "CP-001",
        instructorId: "PROFILE-003",

        date: "2026-01-07",
        startAt: "16:00",

        classType: "Public",
        access: "PUBLIC",

        totalManualCheckin: 12,

        note: "Open class for trial users",

        status: "Completed",
        createdAt: "2026-01-03T09:00:00Z",
        updatedAt: "2026-01-07T17:30:00Z",
    },
];
