"use client";

import React from "react";
import { useMemberDashboard } from "@/hooks/tenant/useMemberDashboard";
import { useMemberAuth } from "@/providers/MemberAuthProvider";
import {
    CreditCard,
    CalendarCheck,
    Target,
    ScanLine,
    Clock,
    Dumbbell,
    TrendingUp,
    ChevronRight,
    Sparkles,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/id";
import Link from "next/link";

dayjs.extend(relativeTime);
dayjs.locale("id");

export default function MemberDashboardPage() {
    const { member } = useMemberAuth();
    const { data, isLoading, isError } = useMemberDashboard();

    if (isLoading || !member) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-6 h-6 text-teal-500" />
                    </div>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0ms]" />
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:150ms]" />
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="text-center text-red-500 py-10 font-medium bg-red-50 rounded-2xl mx-4 mt-8">
                Gagal memuat data dashboard. Silakan muat ulang halaman.
            </div>
        );
    }

    const { summary, upcoming_classes, recent_checkins, pt_packages } = data;

    // Membership status
    const hasMembership = !!summary.active_membership_name;
    const isExpiringSoon =
        summary.membership_end_date &&
        dayjs(summary.membership_end_date).diff(dayjs(), "day") <= 7 &&
        dayjs(summary.membership_end_date).isAfter(dayjs());
    const isExpired =
        summary.membership_end_date &&
        dayjs(summary.membership_end_date).isBefore(dayjs());

    return (
        <div className="space-y-6 font-figtree pb-10 bg-white p-5 rounded-xl border border-gray-500/20">
                {/* ========== HEADER ========== */}
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">
                        Halo, {member.name?.split(" ")[0]} 👋
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-zinc-500">
                            {hasMembership && !isExpired
                                ? `Paket ${summary.active_membership_name} Anda aktif. Tetap semangat!`
                                : "Mulai perjalanan kebugaranmu hari ini."}
                        </p>
                        {hasMembership && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                isExpired ? 'bg-red-100 text-red-700' : isExpiringSoon ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                            }`}>
                                {isExpired
                                    ? "Expired"
                                    : `s/d ${dayjs(summary.membership_end_date).format("DD MMM YYYY")}`}
                            </span>
                        )}
                    </div>
                </div>

                {/* ========== SUMMARY CARDS ========== */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <SummaryCard
                        icon={<ScanLine className="w-5 h-5" />}
                        label="Check-in Bulan Ini"
                        value={summary.checkins_this_month}
                        color="teal"
                    />
                    <SummaryCard
                        icon={<CreditCard className="w-5 h-5" />}
                        label="Sisa Kuota"
                        value={
                            summary.unlimited_checkin
                                ? "Unlimited"
                                : summary.remaining_checkin_quota ?? "—"
                        }
                        color="blue"
                    />
                    <SummaryCard
                        icon={<CalendarCheck className="w-5 h-5" />}
                        label="Kelas Mendatang"
                        value={summary.upcoming_classes_count}
                        color="violet"
                    />
                    <SummaryCard
                        icon={<Target className="w-5 h-5" />}
                        label="Sesi PT Tersisa"
                        value={summary.pt_sessions_remaining}
                        color="amber"
                    />
                </div>

                {/* ========== SECONDARY STAT ========== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Total Kelas Dihadiri
                            </p>
                            <p className="text-2xl font-black text-zinc-900 tracking-tight">
                                {summary.total_classes_attended}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 flex items-center gap-4 shadow-sm">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                            <Dumbbell className="w-6 h-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                Paket PT Aktif
                            </p>
                            <p className="text-2xl font-black text-zinc-900 tracking-tight">
                                {pt_packages.filter((p) => p.status === "active").length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ========== TWO COLUMNS ========== */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Upcoming Classes */}
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between p-5 pb-4 border-b border-zinc-100">
                            <div className="flex items-center gap-2">
                                <CalendarCheck className="w-4 h-4 text-teal-500" />
                                <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
                                    Kelas Mendatang
                                </h2>
                            </div>
                            <Link
                                href="/member/class-schedule"
                                className="text-[10px] font-bold text-teal-600 uppercase tracking-widest hover:text-teal-700 flex items-center gap-1 transition-colors"
                            >
                                Lihat Semua
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-50">
                            {upcoming_classes.length === 0 ? (
                                <div className="py-12 text-center">
                                    <CalendarCheck className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
                                    <p className="text-sm text-zinc-400 font-medium">
                                        Belum ada kelas terjadwal.
                                    </p>
                                    <Link
                                        href="/member/class-schedule"
                                        className="inline-block mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 uppercase tracking-widest"
                                    >
                                        Booking Kelas →
                                    </Link>
                                </div>
                            ) : (
                                upcoming_classes.map((cls) => (
                                    <div
                                        key={cls.id}
                                        className="flex items-center gap-4 p-4 hover:bg-zinc-50/50 transition-colors"
                                    >
                                        <div
                                            className="w-12 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border"
                                            style={{
                                                backgroundColor: `${cls.class_color || "#0f766e"}08`,
                                                borderColor: `${cls.class_color || "#0f766e"}20`,
                                                color: cls.class_color || "#0f766e",
                                            }}
                                        >
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-70">
                                                {dayjs(cls.date).format("MMM")}
                                            </span>
                                            <span className="text-lg font-black leading-none">
                                                {dayjs(cls.date).format("DD")}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-zinc-900 truncate">
                                                {cls.class_name}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-zinc-500 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />{" "}
                                                    {cls.start_at?.slice(0, 5)}
                                                </span>
                                                {cls.instructor_name && (
                                                    <span className="text-xs text-zinc-400">
                                                        {cls.instructor_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {cls.class_category && (
                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2 py-1 rounded-md shrink-0 hidden sm:block">
                                                {cls.class_category}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Recent Check-ins */}
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between p-5 pb-4 border-b border-zinc-100">
                            <div className="flex items-center gap-2">
                                <ScanLine className="w-4 h-4 text-blue-500" />
                                <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
                                    Check-in Terakhir
                                </h2>
                            </div>
                            <Link
                                href="/member/check-ins"
                                className="text-[10px] font-bold text-teal-600 uppercase tracking-widest hover:text-teal-700 flex items-center gap-1 transition-colors"
                            >
                                QR Check-in
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-50">
                            {recent_checkins.length === 0 ? (
                                <div className="py-12 text-center">
                                    <ScanLine className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
                                    <p className="text-sm text-zinc-400 font-medium">
                                        Belum ada riwayat check-in.
                                    </p>
                                </div>
                            ) : (
                                recent_checkins.map((ci) => (
                                    <div
                                        key={ci.id}
                                        className="flex items-center justify-between p-4 hover:bg-zinc-50/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                                                <ScanLine className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-zinc-800">
                                                    {ci.branch_name || "Gym"}
                                                </p>
                                                <p className="text-[11px] text-zinc-400">
                                                    {dayjs(ci.checked_in_at).format(
                                                        "DD MMM YYYY"
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-zinc-500">
                                            {dayjs(ci.checked_in_at).format("HH:mm")}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ========== PT PACKAGES PROGRESS ========== */}
                {pt_packages.length > 0 && (
                    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between p-5 pb-4 border-b border-zinc-100">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-amber-500" />
                                <h2 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
                                    Progress Paket PT
                                </h2>
                            </div>
                            <Link
                                href="/member/pt-session"
                                className="text-[10px] font-bold text-teal-600 uppercase tracking-widest hover:text-teal-700 flex items-center gap-1 transition-colors"
                            >
                                Kelola PT
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                        </div>
                        <div className="divide-y divide-zinc-50">
                            {pt_packages.map((pkg) => {
                                const progress =
                                    pkg.total_sessions > 0
                                        ? (pkg.used_sessions / pkg.total_sessions) * 100
                                        : 0;
                                return (
                                    <div
                                        key={pkg.id}
                                        className="p-5 hover:bg-zinc-50/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-zinc-900">
                                                    {pkg.plan_name}
                                                </h3>
                                                <span
                                                    className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                        pkg.status === "active"
                                                            ? "bg-teal-100 text-teal-700"
                                                            : "bg-amber-100 text-amber-700"
                                                    }`}
                                                >
                                                    {pkg.status}
                                                </span>
                                            </div>
                                            {pkg.expired_at && (
                                                <span className="text-[10px] text-zinc-400 font-medium">
                                                    s/d{" "}
                                                    {dayjs(pkg.expired_at).format(
                                                        "DD MMM YYYY"
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-700 ${
                                                            pkg.status === "active"
                                                                ? "bg-teal-500"
                                                                : "bg-amber-400"
                                                        }`}
                                                        style={{
                                                            width: `${progress}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-xs font-bold text-zinc-600">
                                                    {pkg.used_sessions}/{pkg.total_sessions}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 ml-1">
                                                    sesi
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
        </div>
    );
}

// ========== REUSABLE SUMMARY CARD ==========
function SummaryCard({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
}) {
    const colorMap: Record<string, { bg: string; text: string }> = {
        teal: { bg: "bg-teal-50", text: "text-teal-600" },
        blue: { bg: "bg-blue-50", text: "text-blue-600" },
        violet: { bg: "bg-violet-50", text: "text-violet-600" },
        amber: { bg: "bg-amber-50", text: "text-amber-600" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
        purple: { bg: "bg-purple-50", text: "text-purple-600" },
    };
    const c = colorMap[color] || colorMap.teal;

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
                <div
                    className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center ${c.text} group-hover:scale-105 transition-transform`}
                >
                    {icon}
                </div>
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                {label}
            </p>
            <p className="text-2xl font-black text-zinc-900 tracking-tight">
                {value}
            </p>
        </div>
    );
}
