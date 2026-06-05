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
    { id: "header-main", title: "Menu Utama", isHeader: true },
    {
        id: "nav-dashboard",
        title: "Dashboard",
        path: "/member/dashboard",
        Icon: IconLayoutDashboard,
        IconSolid: IconLayoutDashboardFilled,
    },
    {
        id: "nav-reports",
        title: "Laporan",
        path: "/member/reports",
        Icon: IconFileInvoice,
        IconSolid: IconFileInvoiceFilled,
    },
    {
        id: "nav-membership",
        title: "Keanggotaan",
        path: "/member/membership",
        Icon: IconCreditCard,
        IconSolid: IconCreditCardFilled,
    },
    {
        id: "nav-class-schedule",
        title: "Jadwal Kelas",
        path: "/member/class-schedule",
        Icon: IconCalendar,
        IconSolid: IconCalendarFilled,
    },
    {
        id: "nav-availability-calendar",
        title: "Kalender Interaktif",
        path: "/member/availability-calendar",
        Icon: IconCalendar,
        IconSolid: IconCalendarFilled,
    },
    {
        id: "nav-pt-session",
        title: "Sesi PT",
        path: "/member/pt-session",
        Icon: IconBarbell,
        IconSolid: IconBarbell,
    },
    {
        id: "nav-profile",
        title: "Profil",
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
