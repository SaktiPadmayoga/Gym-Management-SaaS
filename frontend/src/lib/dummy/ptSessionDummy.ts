import { PtSessionData } from "@/types/pt-session";

export const DUMMY_PT_SESSIONS: PtSessionData[] = [
    {
        id: "PTS-001",
        ptSessionPlanId: "PTS-001",
        memberProfileId: "PROFILE-001",
        ptId: "PT-001",
        additionalFeeId: undefined,

        joinDate: "2026-01-02",
        referralSalesId: "SL-001",
        salesType: "Walk In",

        discountAmount: 50000,
        discountPercent: 0,

        extraDurationDay: 0,
        extraSession: 1,

        simpleNote: "New year promo",
        ptSessionStatus: "Active",
    },
    {
        id: "PTS-002",
        ptSessionPlanId: "PTS-002",
        memberProfileId: "PROFILE-002",
        ptId: "PT-002",
        additionalFeeId: undefined,

        joinDate: "2025-12-10",
        referralSalesId: undefined,
        salesType: "Online",

        discountAmount: 0,
        discountPercent: 10,

        extraDurationDay: 7,
        extraSession: 2,

        simpleNote: "Bonus session",
        ptSessionStatus: "Active",
    },
];

/* =======================
   PT SESSION PLAN
======================= */
export const DUMMY_PT_SESSION_PLANS = [
    { id: "PTP-001", name: "10 Sessions Package" },
    { id: "PTP-002", name: "20 Sessions Package" },
];

/* =======================
   MEMBER PROFILE
======================= */
export const DUMMY_MEMBER_PROFILES = [
    { id: "MBR-001", name: "Aditya Putra" },
    { id: "MBR-002", name: "Yanto Kacul" },
    { id: "MBR-003", name: "Kim Ji Eun" },
];

/* =======================
   PERSONAL TRAINER
======================= */
export const DUMMY_PERSONAL_TRAINERS = [
    { id: "PT-001", name: "Coach Andi" },
    { id: "PT-002", name: "Coach Budi" },
];
