import { SubscriptionsData } from "@/types/central/subscriptions";

export const DUMMY_SUBSCRIPTIONS: SubscriptionsData[] = [
    {
        id: "SUB-001",
        tenantId: "TENANT-001",
        planId: "PLAN-STARTER",
        status: "trial",

        startedAt: new Date("2026-01-01"),
        trialEndsAt: new Date("2026-02-01"),
        currentPeriodEndsAt: undefined,

        billingCycle: "monthly",
        amount: 299000,
        autoRenew: true,

        lastInvoiceId: undefined,
        canceledAt: undefined,

        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "SUB-002",
        tenantId: "TENANT-002",
        planId: "PLAN-PRO",
        status: "active",

        startedAt: new Date("2025-12-15"),
        trialEndsAt: undefined,
        currentPeriodEndsAt: new Date("2026-01-15"),

        billingCycle: "monthly",
        amount: 599000,
        autoRenew: true,

        lastInvoiceId: "INV-202601-002",
        canceledAt: undefined,

        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "SUB-003",
        tenantId: "TENANT-003",
        planId: "PLAN-BUSINESS",
        status: "past_due",

        startedAt: new Date("2025-11-01"),
        trialEndsAt: undefined,
        currentPeriodEndsAt: new Date("2025-12-01"),

        billingCycle: "monthly",
        amount: 999000,
        autoRenew: true,

        lastInvoiceId: "INV-202512-003",
        canceledAt: undefined,

        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "SUB-004",
        tenantId: "TENANT-004",
        planId: "PLAN-ENTERPRISE",
        status: "cancelled",

        startedAt: new Date("2025-01-01"),
        trialEndsAt: undefined,
        currentPeriodEndsAt: new Date("2025-12-31"),

        billingCycle: "yearly",
        amount: 0,
        autoRenew: false,

        lastInvoiceId: "INV-202501-004",
        canceledAt: new Date("2025-12-20"),

        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "SUB-005",
        tenantId: "TENANT-005",
        planId: "PLAN-STARTER",
        status: "expired",

        startedAt: new Date("2024-10-01"),
        trialEndsAt: undefined,
        currentPeriodEndsAt: new Date("2025-10-01"),

        billingCycle: "yearly",
        amount: 2990000,
        autoRenew: false,

        lastInvoiceId: "INV-202410-005",
        canceledAt: undefined,

        createdAt: new Date(),
        updatedAt: new Date(),
    },
];
