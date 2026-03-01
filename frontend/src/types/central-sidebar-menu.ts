import {
    IconLayoutDashboard,
    IconLayoutDashboardFilled,
    IconUser,
    IconUserFilled,
    IconUsers,
    IconUsersGroup,
    IconDatabase,
    IconDatabaseSmile,
    IconHierarchy,
    IconCherryFilled,
    IconCalendarCheck,
    IconCalendarFilled,
    IconHistory,
    IconFileInvoice,
    IconFileInvoiceFilled,
    IconCoin,
    IconCoinFilled,
    IconCreditCard,
    IconCreditCardFilled,
    IconRefresh,
    IconSettings,
    IconSettingsFilled,
    IconClock,
    IconClockFilled,
    IconShieldLock,
    IconBarbell,
    IconBarbellFilled,
    IconCards,
    IconCardsFilled,
    IconDeviceIpadDollar,
    IconKey,
    IconKeyFilled,
    IconLink,
    IconUnlink,
} from "@tabler/icons-react";

/**
 * Icon type helper
 */
export type IconType = typeof IconLayoutDashboard;

export interface AdminSidebarItem {
    id: string;
    title: string;
    path?: string | null;
    Icon?: IconType | null;
    IconSolid?: IconType | null;
    children?: AdminSidebarItem[];
    isHeader?: boolean;
}

export const adminSidebarData: AdminSidebarItem[] = [
    // =========================
    // MAIN MENU
    // =========================
    { id: "header-main", title: "Main Menu", isHeader: true },
    {
        id: "nav-dashboard",
        title: "Dashboard",
        path: "/admin/dashboard",
        Icon: IconLayoutDashboard,
        IconSolid: IconLayoutDashboardFilled,
    },

    // =========================
    // TENANT & SUBSCRIPTION
    // =========================
    { id: "header-transaction", title: "Tenant & Subscription", isHeader: true },
    {
        id: "nav-tenant",
        title: "Tenants",
        path: "/admin/tenants",
        Icon: IconBarbell,
        IconSolid: IconBarbellFilled,
    },

    {
        id: "nav-domain",
        title: "Domains",
        path: "/admin/domains",
        Icon: IconLink,
        IconSolid: IconLink,
    },
    {
        id: "nav-domain-request",
        title: "Domain Requests",
        path: "/admin/domain-requests",
        Icon: IconUnlink,
        IconSolid: IconUnlink,
    },
    
    {
        id: "nav-plan",
        title: "Plans",
        path: "/admin/plans",
        Icon: IconCards,
        IconSolid: IconCardsFilled,
    },
    {
        id: "nav-subscription",
        title: "Subscription",
        path: "/admin/subscriptions",
        Icon: IconCreditCard,
        IconSolid: IconCreditCardFilled,
    },
    {
        id: "nav-subscription-history",
        title: "Subscription History",
        path: "/admin/subscription-history",
        Icon: IconHistory,
        IconSolid: IconHistory,
    },

    // =========================
    // BILLING & PAYMENT
    // =========================
    { id: "header-billing", title: "Billing & Payment", isHeader: true },
    {
        id: "nav-invoice",
        title: "Invoices",
        path: "/admin/invoices",
        Icon: IconFileInvoice,
        IconSolid: IconFileInvoiceFilled,
    },
    {
        id: "nav-payment",
        title: "Payments",
        path: "/admin/payments",
        Icon: IconCoin,
        IconSolid: IconCoinFilled,
    },
    {
        id: "nav-refund",
        title: "Refunds",
        path: "/admin/refunds",
        Icon: IconRefresh,
        IconSolid: IconRefresh,
    },
    {
        id: "nav-payment-method",
        title: "Payment Methods",
        path: "/admin/payment-methods",
        Icon: IconDeviceIpadDollar,
        IconSolid: IconDeviceIpadDollar,
    },

    // =========================
    // USER MANAGEMENT
    // =========================
    { id: "header-user", title: "User Management", isHeader: true },
    {
        id: "nav-users",
        title: "Admins",
        path: "/admin/admins",
        Icon: IconUsers,
        IconSolid: IconUsers,
    },
    // {
    //     id: "nav-tenant-users",
    //     title: "Tenant Users",
    //     path: "/admin/tenant-users",
    //     Icon: IconUsersGroup,
    //     IconSolid: IconUsersGroup,
    // },
    // {
    //     id: "nav-roles",
    //     title: "Roles",
    //     path: "/roles",
    //     Icon: IconShieldLock,
    //     IconSolid: IconShieldLock,
    // },
    // {
    //     id: "nav-permissions",
    //     title: "Permissions",
    //     path: "/permissions",
    //     Icon: IconKey,
    //     IconSolid: IconKeyFilled,
    // },

    // =========================
    // ANALYTICS & CONTROL
    // =========================
    { id: "header-analytics", title: "Analytics & Control", isHeader: true },
    {
        id: "nav-activity-log",
        title: "Tenant Activity Logs",
        path: "/admin/tenant-activity-logs",
        Icon: IconClock,
        IconSolid: IconClockFilled,
    },
    {
        id: "nav-settings",
        title: "Settings",
        path: "/admin/settings",
        Icon: IconSettings,
        IconSolid: IconSettingsFilled,
    },
];
