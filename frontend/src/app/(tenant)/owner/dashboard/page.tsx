"use client";

import React from "react";
import { useOwnerDashboard } from "@/hooks/tenant/useOwnerDashboard";
import {
    Users,
    UserPlus,
    CreditCard,
    DollarSign,
    ScanLine,
    CalendarCheck,
    Activity,
    Clock,
    Receipt,
    Building2,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    Snowflake,
    AlertTriangle,
    ChevronRight,
    MapPin,
    Calendar,
    Sparkles,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
import "dayjs/locale/id";

// Custom components & hooks
import { useTenantHeader } from "@/hooks/useTenantHeader";
import OwnerOnboardingModal from "@/components/owner/OwnerOnboardingModal";

dayjs.locale("id");

// Helper format Rupiah
const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(angka);
};

// Status badge color map untuk Transaksi
const statusColor: Record<string, string> = {
    paid: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border border-amber-200",
    failed: "bg-rose-50 text-rose-700 border border-rose-200",
    expired: "bg-zinc-100 text-zinc-500 border border-zinc-200",
    canceled: "bg-zinc-100 text-zinc-500 border border-zinc-200",
};

// Salam dinamis berdasarkan waktu
const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
};

export default function DashboardOwner() {
    const { data: tenantData } = useTenantHeader();
    const { data, isLoading, isError } = useOwnerDashboard();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                <p className="text-sm font-medium text-zinc-500 animate-pulse">Memuat dashboard analitik...</p>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="text-center py-12 max-w-md mx-auto">
                <div className="bg-rose-50 text-rose-800 p-4 rounded-xl border border-rose-200 shadow-sm">
                    <AlertTriangle className="mx-auto mb-2 text-rose-600" size={32} />
                    <h3 className="font-bold text-lg mb-1">Gagal Memuat Analitik</h3>
                    <p className="text-sm opacity-90 mb-4">Sistem gagal mengambil data dashboard dari server pusat.</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    const { summary, revenue_chart, branch_performance, expiring_memberships, recent_check_ins, recent_transactions } = data;

    // Render growth badge helper
    const renderGrowthBadge = (current: number, previous: number) => {
        if (previous === 0 && current === 0) return null;

        let pct = 0;
        if (previous === 0) {
            pct = 100;
        } else {
            pct = ((current - previous) / previous) * 100;
        }

        const isPositive = pct >= 0;
        const absPct = Math.abs(pct);

        return (
            <div className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-semibold ${isPositive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                {isPositive ? <ArrowUpRight size={13} className="text-emerald-600" /> : <TrendingDown size={13} className="text-rose-600" />}
                <span>
                    {isPositive ? "+" : "-"}
                    {absPct.toFixed(0)}%
                </span>
            </div>
        );
    };

    return (
        <div className="space-y-6 font-figtree pb-12">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white  text-zinc-900 p-6 rounded-2xl border border-zinc-200 shadow-xs relative overflow-hidden">
                <div className="space-y-1 relative z-10">
                    <div className="flex items-center gap-2 text-aksen-primary text-sm font-semibold tracking-wider uppercase">
                        <Sparkles size={16} />
                        <span>Pusat Kontrol Owner</span>
                    </div>
                    <h1 className="text-3xl font-extrabold font-outfit tracking-tight">{getGreeting()}, Owner GymFit</h1>
                    <p className="text-zinc-400 text-sm flex items-center gap-2">
                        <Building2 size={16} className="text-zinc-500" />
                        Memantau <span className="text-zinc-900 font-bold">{summary.total_branches}</span> cabang aktif di sistem pusat.
                    </p>
                </div>
                <div
                    className=" border-aksen-secondary
                  border  px-4 py-3 rounded-xl flex items-center gap-3 relative z-10 self-start md:self-auto"
                >
                    <Calendar className="text-aksen-primary" size={20} />
                    <div className="text-left">
                        <p className="text-[10px] text-aksen-primary uppercase tracking-wider font-bold">Hari Ini</p>
                        <p className="text-sm font-semibold text-aksen-secondary ">{dayjs().format("dddd, DD MMMM YYYY")}</p>
                    </div>
                </div>
            </div>

            {/* CORE KPI SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* KPI 1: Revenue Bulan Ini */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Revenue Bulan Ini</span>
                            <h3 className="text-2xl font-bold text-zinc-900 font-outfit tracking-tight">{formatRupiah(summary.revenue_this_month)}</h3>
                        </div>
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100">
                        <span className="text-xs text-zinc-400">vs bulan sebelumnya</span>
                        {renderGrowthBadge(summary.revenue_this_month, summary.revenue_last_month)}
                    </div>
                </div>

                {/* KPI 2: Member Baru */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pendaftaran Member</span>
                            <h3 className="text-2xl font-bold text-zinc-900 font-outfit tracking-tight">
                                {summary.new_members_this_month} <span className="text-sm font-normal text-zinc-500">orang</span>
                            </h3>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <UserPlus size={20} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100">
                        <span className="text-xs text-zinc-400">vs bulan sebelumnya</span>
                        {renderGrowthBadge(summary.new_members_this_month, summary.new_members_last_month)}
                    </div>
                </div>

                {/* KPI 3: Check-in Hari Ini */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Check-in Hari Ini</span>
                            <h3 className="text-2xl font-bold text-zinc-900 font-outfit tracking-tight">
                                {summary.check_ins_today} <span className="text-sm font-normal text-zinc-500">kali</span>
                            </h3>
                        </div>
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                            <ScanLine size={20} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100">
                        <span className="text-xs text-zinc-400">vs kemarin</span>
                        {renderGrowthBadge(summary.check_ins_today, summary.check_ins_yesterday)}
                    </div>
                </div>

                {/* KPI 4: Sesi PT & Kelas Hari Ini */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Operasional Hari Ini</span>
                            <h3 className="text-lg font-bold text-zinc-900 font-outfit tracking-tight leading-snug">
                                {summary.upcoming_classes_today} Kelas & {summary.pt_sessions_today} PT
                            </h3>
                        </div>
                        <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100">
                            <CalendarCheck size={20} />
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-100 text-xs text-zinc-400">
                        <span>Sesi aktif terjadwal</span>
                        <span className="font-semibold text-zinc-600">Total {summary.upcoming_classes_today + summary.pt_sessions_today} kegiatan</span>
                    </div>
                </div>
            </div>

            {/* REVENUE TRENDS & MEMBERSHIP HEALTH ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Revenue Trend (2/3 width) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                    <Activity size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-zinc-900 font-outfit">Tren Pendapatan Konsolidasi</h2>
                                    <p className="text-xs text-zinc-500">Akumulasi pendapatan seluruh cabang dalam 6 bulan terakhir</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenue_chart} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.01} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} dy={10} />
                                    <YAxis
                                        tickFormatter={(value) => (value >= 1000000 ? `Rp ${value / 1000000}jt` : value >= 1000 ? `Rp ${value / 1000}rb` : `Rp ${value}`)}
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11, fill: "#6B7280" }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        formatter={(value: number) => [formatRupiah(value), "Total Revenue"]}
                                        labelStyle={{ color: "#111827", fontWeight: 600 }}
                                        contentStyle={{
                                            borderRadius: "12px",
                                            border: "1px solid #E5E7EB",
                                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)",
                                        }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Right Column: Membership Health (1/3 width) */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                                <CreditCard size={18} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-zinc-900 font-outfit">Status Membership</h2>
                                <p className="text-xs text-zinc-500">Kesehatan portofolio member seluruh cabang</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Active Memberships */}
                            <div className="flex items-center justify-between p-3.5 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl transition-colors border border-emerald-100/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-emerald-500 text-white shadow-sm">
                                        <Users size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-800">Membership Aktif</p>
                                        <p className="text-xs text-zinc-500">Masa aktif berjalan normal</p>
                                    </div>
                                </div>
                                <span className="text-lg font-extrabold text-emerald-700 font-outfit">{summary.active_memberships}</span>
                            </div>

                            {/* Expiring Soon */}
                            <div className="flex items-center justify-between p-3.5 bg-amber-50/50 hover:bg-amber-50 rounded-xl transition-colors border border-amber-100/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm">
                                        <AlertTriangle size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-800">Akan Expire (≤7 hari)</p>
                                        <p className="text-xs text-zinc-500">Perlu ditindaklanjuti tim marketing</p>
                                    </div>
                                </div>
                                <span className="text-lg font-extrabold text-amber-700 font-outfit">{summary.expiring_soon_count}</span>
                            </div>

                            {/* Frozen Count */}
                            <div className="flex items-center justify-between p-3.5 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-colors border border-blue-100/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500 text-white shadow-sm">
                                        <Snowflake size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-800">Member Beku (Frozen)</p>
                                        <p className="text-xs text-zinc-500">Masa aktif ditangguhkan</p>
                                    </div>
                                </div>
                                <span className="text-lg font-extrabold text-blue-700 font-outfit">{summary.frozen_count}</span>
                            </div>

                            {/* Pending Transactions */}
                            <div className="flex items-center justify-between p-3.5 bg-rose-50/50 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-rose-500 text-white shadow-sm">
                                        <Receipt size={16} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-800">Invoice Belum Dibayar</p>
                                        <p className="text-xs text-zinc-500">Menunggu pembayaran (pending)</p>
                                    </div>
                                </div>
                                <span className="text-lg font-extrabold text-rose-700 font-outfit">{summary.pending_transactions}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PERFORMANCE BY BRANCH (Multi-branch metrics) */}
            <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                        <Building2 size={18} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 font-outfit">Performa Kontribusi Per Cabang</h2>
                        <p className="text-xs text-zinc-500">Perbandingan data operasional dan keuangan antar cabang aktif</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50/70 rounded-lg">
                                <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Nama Cabang</th>
                                <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Total Member</th>
                                <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Membership Aktif</th>
                                <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Check-in Hari Ini</th>
                                <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Revenue Bulan Ini</th>
                                <th className="py-3 px-4 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right w-[200px]">Kontribusi Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {branch_performance.length > 0 ? (
                                (() => {
                                    const sortedBranches = [...branch_performance].sort((a, b) => b.revenue_this_month - a.revenue_this_month);
                                    const maxRevenue = Math.max(...sortedBranches.map((b) => b.revenue_this_month), 1);
                                    const totalRevenue = sortedBranches.reduce((acc, curr) => acc + curr.revenue_this_month, 0);

                                    return sortedBranches.map((bp) => {
                                        const contributionPct = totalRevenue > 0 ? (bp.revenue_this_month / totalRevenue) * 100 : 0;

                                        return (
                                            <tr key={bp.id} className="hover:bg-zinc-50/50 transition-colors">
                                                <td className="py-4 px-4 font-semibold text-zinc-950 flex items-center gap-2">
                                                    <MapPin size={15} className="text-zinc-400" />
                                                    {bp.name}
                                                </td>
                                                <td className="py-4 px-4 text-center font-medium text-zinc-700">{bp.members_count}</td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">{bp.active_memberships}</span>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">{bp.check_ins_today}</span>
                                                </td>
                                                <td className="py-4 px-4 text-right font-bold text-zinc-950">{formatRupiah(bp.revenue_this_month)}</td>
                                                <td className="py-4 px-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                                                            <span>{contributionPct.toFixed(1)}%</span>
                                                        </div>
                                                        <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                                                            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${contributionPct}%` }} />
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    });
                                })()
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-sm text-zinc-400">
                                        <Building2 size={24} className="mx-auto mb-2 text-zinc-300" />
                                        Belum ada data cabang aktif.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DETAILED BOTTOM PANELS (TWO COLUMNS) */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Panel Left: Expiring Memberships */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                                    <AlertTriangle size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-zinc-900 font-outfit">Peringatan Membership Segera Expire</h2>
                                    <p className="text-xs text-zinc-500">Daftar member dengan masa aktif habis dalam waktu dekat (≤7 hari)</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-100">
                                        <th className="py-3 px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Member & Paket</th>
                                        <th className="py-3 px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Cabang</th>
                                        <th className="py-3 px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Sisa Waktu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {expiring_memberships.length > 0 ? (
                                        expiring_memberships.map((m, idx) => {
                                            const isUrgent = m.days_left <= 2;
                                            return (
                                                <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                                                    <td className="py-3 px-2">
                                                        <p className="text-sm font-semibold text-zinc-950">{m.member_name}</p>
                                                        <p className="text-xs text-zinc-500">{m.plan_name || "Paket Kustom"}</p>
                                                    </td>
                                                    <td className="py-3 px-2 text-center">
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-full">
                                                            <MapPin size={11} className="text-zinc-400" />
                                                            {m.branch_name}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        <span
                                                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                                                                isUrgent ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-amber-50 text-amber-700 border border-amber-100"
                                                            }`}
                                                        >
                                                            {m.days_left} Hari Lagi
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-sm text-zinc-400">
                                                Tidak ada membership yang akan habis dalam 7 hari kedepan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Panel Right: Transaksi Terbaru */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                    <Receipt size={18} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-zinc-900 font-outfit">Arus Transaksi Terbaru</h2>
                                    <p className="text-xs text-zinc-500">Aktivitas penagihan dan pembayaran di seluruh cabang</p>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-zinc-100">
                                        <th className="py-3 px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Member / Inv</th>
                                        <th className="py-3 px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider">Cabang</th>
                                        <th className="py-3 px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider text-center">Status</th>
                                        <th className="py-3 px-2 text-xs font-bold text-zinc-500 uppercase tracking-wider text-right">Nominal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                    {recent_transactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                                            <td className="py-3 px-2">
                                                <p className="text-sm font-semibold text-zinc-950">{tx.member_name}</p>
                                                <p className="text-[10px] text-zinc-400 font-mono">{tx.invoice_number}</p>
                                            </td>
                                            <td className="py-3 px-2">
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-zinc-600">
                                                    <MapPin size={11} className="text-zinc-400" />
                                                    {tx.branch_name}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider ${statusColor[tx.status] || "bg-zinc-100 text-zinc-700"}`}>{tx.status}</span>
                                            </td>
                                            <td className="py-3 px-2 text-sm font-bold text-zinc-950 text-right">{formatRupiah(tx.total_amount)}</td>
                                        </tr>
                                    ))}
                                    {recent_transactions.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-sm text-zinc-400">
                                                Belum ada riwayat transaksi.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* LIVE SCAN CHECK-INS ROW */}
            {/* <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                            <Clock size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 font-outfit">Log Check-in Terkini</h2>
                            <p className="text-xs text-zinc-500">Kehadiran real-time member di gerbang masuk seluruh cabang</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {recent_check_ins.length > 0 ? (
                        recent_check_ins.map((ci) => (
                            <div key={ci.id} className="flex items-center gap-3 p-3 bg-zinc-50/50 hover:bg-zinc-50 rounded-xl border border-zinc-100 transition-colors">
                                {ci.member_avatar ? (
                                    <img src={ci.member_avatar} alt={ci.member_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-100 shadow-sm" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center font-bold text-zinc-500 text-xs font-outfit shadow-sm">
                                        {ci.member_name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1 space-y-0.5">
                                    <p className="text-sm font-bold text-zinc-950 truncate">{ci.member_name}</p>
                                    <p className="text-[10px] text-zinc-500 flex items-center gap-1">
                                        <MapPin size={10} className="text-zinc-400" />
                                        <span className="truncate">{ci.branch_name}</span>
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-medium">{dayjs(ci.checked_in_at).format("DD MMM, HH:mm")} WIB</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-8 text-center text-sm text-zinc-400">Belum ada log scan masuk hari ini.</div>
                    )}
                </div>
            </div> */}

            {/* Modal Onboarding Owner */}
            <OwnerOnboardingModal tenantName={tenantData?.name} />
        </div>
    );
}
