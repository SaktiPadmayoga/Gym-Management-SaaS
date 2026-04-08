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
import { OwnerSidebarItem } from "./owner-sidebar-menu";

/**
 * Icon type helper
 */
export type IconType = typeof IconLayoutDashboard;

export interface MemberSidebarItem {
    id: string;
    title: string;
    path?: string | null;
    Icon?: IconType | null;
    IconSolid?: IconType | null;
    children?: MemberSidebarItem[];
    isHeader?: boolean;
}

export const memberSidebarData: MemberSidebarItem[] = [
    // =========================
    // MAIN MENU
    // =========================
    { id: "header-main", title: "Main Menu", isHeader: true },
    {
        id: "nav-dashboard",
        title: "Dashboard",
        path: "/member/dashboard",
        Icon: IconLayoutDashboard,
        IconSolid: IconLayoutDashboardFilled,
    },
    {
        id: "nav-reports",
        title: "Reports",
        path: "/member/reports",
        Icon: IconFileInvoice,
        IconSolid: IconFileInvoiceFilled,
    },

    {
        id: "nav-subscription",
        title: "Subscription",
        path: "/member/subscription",
        Icon: IconCreditCard,
        IconSolid: IconCreditCardFilled,
    },
    {
        id: "nav-profile",
        title: "Profile",
        path: "/member/profile",
        Icon: IconUser,
        IconSolid: IconUserFilled,
    },
];
