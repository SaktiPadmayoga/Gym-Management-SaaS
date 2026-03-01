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
        title: "Reports",
        path: "/owner/reports",
        Icon: IconFileInvoice,
        IconSolid: IconFileInvoiceFilled,
    },

    // =========================
    // TENANT & SUBSCRIPTION
    // =========================
    { id: "header-transaction", title: "Tenant & Subscription", isHeader: true },
    {
        id: "nav-branches",
        title: "Branches",
        path: "/owner/branches",
        Icon: IconBarbell,
        IconSolid: IconBarbellFilled,
    },
    {
        id: "nav-domains",
        title: "Domains",
        path: "/owner/domains",
        Icon: IconLink,
        IconSolid: IconLink,
    },
    {
        id: "nav-subscription",
        title: "Subscription",
        path: "/owner/subscriptions",
        Icon: IconCreditCard,
        IconSolid: IconCreditCardFilled,
    },
    {
        id: "nav-profile",
        title: "Profile",
        path: "/owner/profile",
        Icon: IconUser,
        IconSolid: IconUserFilled,
    },


    // =========================
    // USER MANAGEMENT
    // =========================
    { id: "header-user", title: "User Management", isHeader: true },
    {
        id: "nav-users",
        title: "Users",
        path: "/owner/users",
        Icon: IconUsersGroup,
        IconSolid: IconUsersGroup,
    },

    // =========================
    // ANALYTICS & CONTROL
    // =========================
    { id: "header-analytics", title: "Analytics & Control", isHeader: true },
    {
        id: "nav-activity-log",
        title: "Activity Logs",
        path: "/owner/activity-logs",
        Icon: IconClock,
        IconSolid: IconClockFilled,
    },
    {
        id: "nav-settings",
        title: "Settings",
        path: "/owner/settings",
        Icon: IconSettings,
        IconSolid: IconSettingsFilled,
    },

  
];
