// src/data/sidebarData.tsx
import React from "react";
import {
    UserIcon,
    UsersIcon,
    Squares2X2Icon,
    CurrencyDollarIcon,
    TicketIcon,
    ClockIcon,
    BuildingOfficeIcon,
    CalendarDaysIcon,
    ShoppingCartIcon,
    DocumentChartBarIcon,
    UserGroupIcon,
    PresentationChartLineIcon,
    ArchiveBoxIcon,
    BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

import {
    Squares2X2Icon as Squares2X2IconSolid,
    UserIcon as UserIconSolid,
    UsersIcon as UsersIconSolid,
    CurrencyDollarIcon as CurrencyDollarIconSolid,
    TicketIcon as TicketIconSolid,
    ClockIcon as ClockIconSolid,
    BuildingOfficeIcon as BuildingOfficeIconSolid,
    CalendarDaysIcon as CalendarDaysIconSolid,
    ShoppingCartIcon as ShoppingCartIconSolid,
    DocumentChartBarIcon as DocumentChartBarIconSolid,
    UserGroupIcon as UserGroupIconSolid,
    PresentationChartLineIcon as PresentationChartLineIconSolid,
    ArchiveBoxIcon as ArchiveBoxIconSolid,
    BuildingOffice2Icon as BuildingOffice2IconSolid,
} from "@heroicons/react/24/solid";
import { IconSettings, IconSettingsFilled } from "@tabler/icons-react";

export type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export interface SidebarItem {
    id: string;
    title: string;
    path?: string | null;
    Icon?: IconType | null;
    IconSolid?: IconType | null;
    children?: SidebarItem[];
    isHeader?: boolean;
    permission?: string; // ← tambah, opsional — kalau undefined = semua bisa akses
}

export const sidebarData: SidebarItem[] = [
    // MAIN MENU
    { id: "header-main", title: "Menu Utama", isHeader: true },
    { id: "nav-dashboard", title: "Dashboard", path: "/dashboard", Icon: Squares2X2Icon, IconSolid: Squares2X2IconSolid },

    // TRANSACTION
    { id: "header-transaction", title: "Transaksi", isHeader: true },
    { id: "nav-membership",        title: "Keanggotaan",       path: "/memberships",       Icon: UserIcon,           IconSolid: UserIconSolid,           permission: "memberships" },
    { id: "nav-class",             title: "Jadwal Kelas",   path: "/class-schedules",   Icon: CalendarDaysIcon,   IconSolid: CalendarDaysIconSolid,   permission: "bookings" },
    { id: "nav-facility-bookings", title: "Pemesanan Fasilitas", path: "/facility-bookings", Icon: BuildingOffice2Icon,IconSolid: BuildingOffice2IconSolid, permission: "bookings" },
    { id: "nav-pt-sessions",       title: "Sesi PT",       path: "/pt-sessions",       Icon: UserGroupIcon,      IconSolid: UserGroupIconSolid,      permission: "pt_sessions" },
    { id: "nav-pos",               title: "POS",               path: "/pos",               Icon: CurrencyDollarIcon, IconSolid: CurrencyDollarIconSolid, permission: "pos" },
    { id: "nav-checkinout",        title: "Check-In",         path: "/check-ins",         Icon: ClockIcon,          IconSolid: ClockIconSolid,          permission: "check_ins" },

    // MASTER DATA
    { id: "header-master", title: "Data Master", isHeader: true },
    { id: "nav-member",           title: "Member",           path: "/members",           Icon: UserIcon,           IconSolid: UserIconSolid,           permission: "members" },
    { id: "nav-membership-plan",  title: "Paket Keanggotaan",  path: "/membership-plans",  Icon: UsersIcon,          IconSolid: UsersIconSolid,          permission: "master_data" },
    { id: "nav-class-plan",       title: "Paket Kelas",       path: "/class-plans",       Icon: CalendarDaysIcon,   IconSolid: CalendarDaysIconSolid,   permission: "master_data" },
    { id: "nav-pt-sessions-plan", title: "Paket Sesi PT", path: "/pt-sessions-plans", Icon: UserGroupIcon,      IconSolid: UserGroupIconSolid,      permission: "master_data" },
    { id: "nav-facility",         title: "Fasilitas",        path: "/facilities",        Icon: BuildingOffice2Icon,IconSolid: BuildingOffice2IconSolid, permission: "master_data" },
    { id: "nav-products",         title: "Produk",          path: "/products",          Icon: ArchiveBoxIcon,     IconSolid: ArchiveBoxIconSolid,     permission: "master_data" },
    { id: "nav-staff",            title: "Staf",            path: "/staffs",            Icon: UserGroupIcon,      IconSolid: UserGroupIconSolid,      permission: "staff" },

    // REPORTS
    { id: "header-reports", title: "Laporan", isHeader: true },
    {
        id: "nav-report",
        title: "Laporan",
        path: "/report",
        Icon: DocumentChartBarIcon,
        IconSolid: DocumentChartBarIconSolid,
        permission: "reports",
        children: [
            { id: "report-daily",               title: "Laporan Harian",       path: "/report/daily",                    Icon: CalendarDaysIcon,        IconSolid: CalendarDaysIconSolid },
            { id: "report-member",              title: "Analisis Member",              path: "/report/member-analytics",         Icon: UsersIcon,               IconSolid: UsersIconSolid },
            { id: "report-membership",          title: "Keanggotaan",          path: "/report/membership",               Icon: TicketIcon,              IconSolid: TicketIconSolid },
            { id: "report-pt-sessions",         title: "Sesi PT",         path: "/report/pt-sessions",              Icon: ClockIcon,               IconSolid: ClockIconSolid },
            { id: "report-facility",            title: "Fasilitas",            path: "/report/facility",                 Icon: BuildingOfficeIcon,      IconSolid: BuildingOfficeIconSolid },
            { id: "report-class",               title: "Kelas",               path: "/report/class",                    Icon: CalendarDaysIcon,        IconSolid: CalendarDaysIconSolid },
            { id: "report-pos",                 title: "POS",                 path: "/report/pos",                      Icon: ShoppingCartIcon,        IconSolid: ShoppingCartIconSolid },
            { id: "report-checkin-time",        title: "Waktu Check-In",        path: "/report/checkin-time",             Icon: ClockIcon,               IconSolid: ClockIconSolid },
            { id: "report-checkin-member",      title: "Member Check-In",      path: "/report/checkin-member",           Icon: UsersIcon,               IconSolid: UsersIconSolid },
            { id: "report-finance-sales",       title: "Keuangan & Penjualan",       path: "/report/finance-sales",            Icon: PresentationChartLineIcon, IconSolid: PresentationChartLineIconSolid },
        ],
    },
    {
        id: "nav-settings",
        title: "Pengaturan",
        path: "/settings",
        Icon: IconSettings,
        IconSolid: IconSettingsFilled,
        permission: "settings",
    },
];
