import {
    IconLayoutDashboard,
    IconLayoutDashboardFilled,
    IconUser,
    IconUserFilled,
    IconFileInvoice,
    IconFileInvoiceFilled,
    IconCreditCard,
    IconCreditCardFilled,
    IconClock,
    IconClockFilled,
    IconCalendar,
    IconCalendarFilled,
    IconBarbell,
} from "@tabler/icons-react";

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
        id: "nav-membership",
        title: "Membership",
        path: "/member/membership",
        Icon: IconCreditCard,
        IconSolid: IconCreditCardFilled,
    },
    {
        id: "nav-class-schedule",
        title: "Class Schedule",
        path: "/member/class-schedule",
        Icon: IconCalendar,
        IconSolid: IconCalendarFilled,
    },
    {
        id: "nav-pt-session",
        title: "PT Session",
        path: "/member/pt-session",
        Icon: IconBarbell,
        IconSolid: IconBarbell,
    },
    {
        id: "nav-profile",
        title: "Profile",
        path: "/member/profile",
        Icon: IconUser,
        IconSolid: IconUserFilled,
    },
    {
        id: "nav-check-ins",
        title: "Check-in",
        path: "/member/check-ins",
        Icon: IconClock,
        IconSolid: IconClockFilled,
    },
];
