import { MembershipData } from "@/types/membership";

export const DUMMY_MEMBERSHIPS: MembershipData[] = [
    {
        id: "MBR-001",

        membershipPlanId: "MP-001",
        memberProfileId: "PROFILE-001",

        additionalFeeId: "AF-001",

        joinDate: "2026-01-02",

        referralSalesId: "SL-001",
        salesType: "Walk In",

        discountAmount: 50000,
        discountPercent: 0,

        extraDurationDay: 0,
        extraMembershipSession: 0,

        simpleNote: "New year promo",

        membershipStatus: "Active",
    },
    {
        id: "MBR-002",

        membershipPlanId: "MP-001",
        memberProfileId: "PROFILE-002",

        additionalFeeId: undefined,

        joinDate: "2025-12-15",

        referralSalesId: undefined,
        salesType: "Online",

        discountAmount: 0,
        discountPercent: 10,

        extraDurationDay: 7,
        extraMembershipSession: 2,

        simpleNote: "Bonus session from admin",

        membershipStatus: "Active",
    },
];
