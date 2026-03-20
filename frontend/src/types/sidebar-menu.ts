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
    QrCodeIcon,
    PencilSquareIcon,
    ArrowRightOnRectangleIcon,
    BellIcon,
    Cog6ToothIcon,
    PresentationChartLineIcon,
    DocumentMinusIcon,
    DocumentCurrencyDollarIcon,
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
    QrCodeIcon as QrCodeIconSolid,
    PencilSquareIcon as PencilSquareIconSolid,
    ArrowRightOnRectangleIcon as ArrowRightOnRectangleIconSolid,
    PresentationChartLineIcon as PresentationChartLineIconSolid,
    DocumentMinusIcon as DocumentMinusIconSolid,
    DocumentCurrencyDollarIcon as DocumentCurrencyDollarIconSolid,
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
}

export const sidebarData: SidebarItem[] = [
    // MAIN MENU
    { id: "header-main", title: "Main Menu", isHeader: true },
    { id: "nav-dashboard", title: "Dashboard", path: "/dashboard", Icon: Squares2X2Icon, IconSolid: Squares2X2IconSolid },

    // TRANSACTION
    { id: "header-transaction", title: "Transaction", isHeader: true },
    { id: "nav-membership", title: "Membership", path: "/membership", Icon: UserIcon, IconSolid: UserIconSolid },
    { id: "nav-class", title: "Class Schedule", path: "/class-schedule", Icon: CalendarDaysIcon, IconSolid: CalendarDaysIconSolid },
    { id: "nav-pt-sessions", title: "PT Sessions", path: "/pt-sessions", Icon: UserGroupIcon, IconSolid: UserGroupIconSolid },
    { id: "nav-pos", title: "POS", path: "/pos", Icon: CurrencyDollarIcon, IconSolid: CurrencyDollarIconSolid },
    {
        id: "nav-checkinout",
        title: "Check in/out",
        path: "/check-in-out",
        Icon: ClockIcon,
        IconSolid: ClockIconSolid,
        children: [
            { id: "checkin-history", title: "History", path: "/check-in-out/history", Icon: CalendarDaysIcon, IconSolid: CalendarDaysIconSolid },
            { id: "checkin-manual", title: "Check in Manual", path: "/check-in-out/check-in/manual", Icon: PencilSquareIcon, IconSolid: PencilSquareIconSolid },
            { id: "checkin-qr", title: "Check in QR", path: "/check-in-out/check-in/qr", Icon: QrCodeIcon, IconSolid: QrCodeIconSolid },
            { id: "checkout-manual", title: "Check out Manual", path: "/check-in-out/check-out/manual", Icon: ArrowRightOnRectangleIcon, IconSolid: ArrowRightOnRectangleIconSolid },
            { id: "checkout-qr", title: "Check out QR", path: "/check-in-out/check-out/qr", Icon: QrCodeIcon, IconSolid: QrCodeIconSolid },
        ],
    },

    // MASTER DATA
    { id: "header-master", title: "Master Data", isHeader: true },
    { id: "nav-member", title: "Members", path: "/members", Icon: UserIcon, IconSolid: UserIconSolid },
    { id: "nav-membership-plan", title: "Membership Plans", path: "/membership-plan", Icon: UsersIcon, IconSolid: UsersIconSolid },
    { id: "nav-class-plan", title: "Class Plans", path: "/class-plan", Icon: CalendarDaysIcon, IconSolid: CalendarDaysIconSolid },
    { id: "nav-pt-sessions-plan", title: "PT Sessions Plans", path: "/pt-sessions-plan", Icon: UserGroupIcon, IconSolid: UserGroupIconSolid },
    { id: "nav-facility", title: "Facility", path: "/facility", Icon: BuildingOffice2Icon, IconSolid: BuildingOffice2IconSolid },
    { id: "nav-product", title: "Products", path: "/product", Icon: ArchiveBoxIcon, IconSolid: ArchiveBoxIconSolid },
    { id: "nav-staff", title: "Staffs", path: "/staffs", Icon: UserGroupIcon, IconSolid: UserGroupIconSolid },

    // REPORTS
    { id: "header-reports", title: "Reports", isHeader: true },
    {
        id: "nav-report",
        title: "Report",
        path: "/report",
        Icon: DocumentChartBarIcon,
        IconSolid: DocumentChartBarIconSolid,
        children: [
            { id: "report-daily", title: "Daily Reports", path: "/report/daily", Icon: CalendarDaysIcon, IconSolid: CalendarDaysIconSolid },
            { id: "report-member", title: "Member", path: "/report/member-analytics", Icon: UsersIcon, IconSolid: UsersIconSolid },
            { id: "report-membership", title: "Membership", path: "/report/membership", Icon: TicketIcon, IconSolid: TicketIconSolid },
            { id: "report-pt-sessions", title: "PT Sessions", path: "/report/pt-sessions", Icon: ClockIcon, IconSolid: ClockIconSolid },
            { id: "report-facility", title: "Facility", path: "/report/facility", Icon: BuildingOfficeIcon, IconSolid: BuildingOfficeIconSolid },
            { id: "report-class", title: "Class", path: "/report/class", Icon: CalendarDaysIcon, IconSolid: CalendarDaysIconSolid },
            { id: "report-pos", title: "POS", path: "/report/pos", Icon: ShoppingCartIcon, IconSolid: ShoppingCartIconSolid },
            { id: "report-staff", title: "Staff", path: "/report/staff", Icon: UserGroupIcon, IconSolid: UserGroupIconSolid },
            { id: "report-checkin-time", title: "Checkin Time", path: "/report/checkin/time", Icon: ClockIcon, IconSolid: ClockIconSolid },
            { id: "report-checkin-member", title: "Checkin Member", path: "/report/checkin/member", Icon: UsersIcon, IconSolid: UsersIconSolid },
            { id: "report-finance-sales", title: "Finance Sales", path: "/report/finance/sales", Icon: PresentationChartLineIcon, IconSolid: PresentationChartLineIconSolid },
            { id: "report-finance-referral", title: "Finance Referral", path: "/report/finance/referral", Icon: UsersIcon, IconSolid: UsersIconSolid },
            { id: "report-finance-outstanding", title: "Finance Outstanding", path: "/report/finance/outstanding", Icon: DocumentMinusIcon, IconSolid: DocumentMinusIconSolid },
            { id: "report-payment-mutation", title: "Payment Mutation", path: "/report/finance/payment-mutation", Icon: DocumentCurrencyDollarIcon, IconSolid: DocumentCurrencyDollarIconSolid },
        ],
    },
    {
        id: "nav-settings",
        title: "Settings",
        path: "/settings",
        Icon: IconSettings,
        IconSolid: IconSettingsFilled,
    },
];
