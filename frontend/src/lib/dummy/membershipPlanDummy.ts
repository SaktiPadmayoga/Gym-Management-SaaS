import { MembershipPlanData } from "@/types/membership-plan";

export const DUMMY_MEMBERSHIP_PLANS: MembershipPlanData[] = [
    {
        id: "MP-001",
        name: "Daily Visit Pass",
        duration: 1,
        durationUnit: "day",

        price: 100000,
        description: "One day full access membership",

        maxSharingAccess: 0,
        loyaltyPoint: 10,

        /** 🔥 category DINAMIS */
        category: "Daily Visit",

        checkinSetting: {
            accessType: "all_club",
            classAccessType: "all_classes",

            unlimitedCheckinMembership: true,
            unlimitedCheckinClass: false,

            /** unlimited membership → quota TIDAK ADA */
            membershipQuota: undefined,

            /** class terbatas → quota WAJIB ADA */
            classQuota: 3,
        },

        availabilitySetting: {
            unlimitedSold: true,
            quota: undefined,

            alwaysAvailable: true,
            availableFrom: undefined,
            availableUntil: undefined,
        },

        checkinSchedule: {
            monday: { enabled: true, startAt: "00:00", endAt: "23:59" },
            tuesday: { enabled: true, startAt: "00:00", endAt: "23:59" },
            wednesday: { enabled: true, startAt: "00:00", endAt: "23:59" },
            thursday: { enabled: true, startAt: "00:00", endAt: "23:59" },
            friday: { enabled: true, startAt: "00:00", endAt: "23:59" },
            saturday: { enabled: true, startAt: "00:00", endAt: "23:59" },
            sunday: { enabled: true, startAt: "00:00", endAt: "23:59" },
        },
    },

    {
        id: "MP-002",
        name: "Monthly Limited Plan",
        duration: 1,
        durationUnit: "month",

        price: 450000,
        description: "Monthly plan with limited check-in quota",

        maxSharingAccess: 1,
        loyaltyPoint: 50,

        category: "Monthly Membership",

        checkinSetting: {
            accessType: "single_club",
            classAccessType: "regular_class_only",

            unlimitedCheckinMembership: false,
            unlimitedCheckinClass: false,

            /** checkbox OFF → quota muncul */
            membershipQuota: 20,
            classQuota: 10,
        },

        availabilitySetting: {
            unlimitedSold: false,
            quota: 100,

            alwaysAvailable: false,
            availableFrom: "2026-01-01",
            availableUntil: "2026-03-31",
        },

        checkinSchedule: {
            monday: { enabled: true, startAt: "06:00", endAt: "22:00" },
            tuesday: { enabled: true, startAt: "06:00", endAt: "22:00" },
            wednesday: { enabled: true, startAt: "06:00", endAt: "22:00" },
            thursday: { enabled: true, startAt: "06:00", endAt: "22:00" },
            friday: { enabled: true, startAt: "06:00", endAt: "22:00" },
            saturday: { enabled: true, startAt: "08:00", endAt: "20:00" },
            sunday: { enabled: false, startAt: "00:00", endAt: "00:00" },
        },
    },
];
