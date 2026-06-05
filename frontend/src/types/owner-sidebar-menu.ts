import {
    IconLayoutDashboard,
    IconLayoutDashboardFilled,
    IconUser,
    IconUserFilled,
    IconUsersGroup,
    IconFileInvoice,
    IconFileInvoiceFilled,
    IconCreditCard,
    IconCreditCardFilled,
    IconClock,
    IconClockFilled,
    IconBarbell,
    IconBarbellFilled,
    IconLink,
    IconShield,
    IconShieldFilled,
    IconSettings,
    IconSettingsFilled,
} from "@tabler/icons-react";

/**
 * Icon type helper
 */
export type IconType = typeof IconLayoutDashboard;

export interface OwnerSidebarItem {
    id: string;
    title: string;
    path?: string | null;
    Icon?: IconType | null;
    IconSolid?: IconType | null;
    children?: OwnerSidebarItem[];
    isHeader?: boolean;
}

export const ownerSidebarData: OwnerSidebarItem[] = [
    // =========================
    // MAIN MENU
    // =========================
    { id: "header-main", title: "Main Menu", isHeader: true },
    {
        id: "nav-dashboard",
        title: "Dashboard",
        path: "/owner/dashboard",
        Icon: IconLayoutDashboard,
        IconSolid: IconLayoutDashboardFilled,
    },
    {
        id: "nav-reports",
        title: "Laporan",
        path: "/owner/reports",
        Icon: IconFileInvoice,
        IconSolid: IconFileInvoiceFilled,
    },

    // =========================
    // TENANT & SUBSCRIPTION
    // =========================
    { id: "header-tenant", title: "Cabang & Langganan", isHeader: true },
    {
        id: "nav-branches",
        title: "Cabang",
        path: "/owner/branches",
        Icon: IconBarbell,
        IconSolid: IconBarbellFilled,
    },
    {
        id: "nav-domains",
        title: "Domain",
        path: "/owner/domains",
        Icon: IconLink,
        IconSolid: IconLink,
    },
    {
        id: "nav-subscription",
        title: "Status Langganan",
        path: "/owner/subscription",
        Icon: IconCreditCard,
        IconSolid: IconCreditCardFilled,
    },
    {
        id: "nav-gym-settings",
        title: "Pengaturan Gym",
        path: "/owner/settings",
        Icon: IconSettings,
        IconSolid: IconSettingsFilled,
    },

    // =========================
    // USER MANAGEMENT
    // =========================
    { id: "header-user", title: "Manajemen Pengguna", isHeader: true },
    {
        id: "nav-members",
        title: "Member",
        path: "/owner/members",
        Icon: IconUsersGroup,
        IconSolid: IconUsersGroup,
    },
    {
        id: "nav-staff",
        title: "Staf",
        path: "/owner/staffs",
        Icon: IconUser,
        IconSolid: IconUserFilled,
    },
    {
        id: "nav-roles",
        title: "Role & Hak Akses",
        path: "/owner/roles",
        Icon: IconShield,
        IconSolid: IconShieldFilled,
    },

    // =========================
    // ANALYTICS & CONTROL
    // =========================
    // { id: "header-analytics", title: "Riwayat & Kendali", isHeader: true },
    // {
    //     id: "nav-activity-log",
    //     title: "Riwayat Aktivitas",
    //     path: "/owner/activity-logs",
    //     Icon: IconClock,
    //     IconSolid: IconClockFilled,
    // },
];
