"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { DollarSign, CreditCard, Activity, TrendingUp, Star, Building2 } from "lucide-react";
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";

const COLORS = ["#18181B", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(angka);
};

const toNumber = (val: any): number => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
};

type DateRange = { start: string; end: string };

interface OwnerFinanceTabProps {
    data: any;
    startDate: string;
    endDate: string;
    onFilterChange: (range: DateRange) => void;
    isFiltered?: boolean;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function OwnerFinanceTab({ data, startDate, endDate, onFilterChange, isFiltered = false }: OwnerFinanceTabProps) {
    const [period, setPeriod] = useState<"today" | "7d" | "30d" | "this_month" | "custom">("7d");
    const [localCustomRange, setLocalCustomRange] = useState<DateRange>({
        start: dayjs().subtract(7, "day").format("YYYY-MM-DD"),
        end: dayjs().format("YYYY-MM-DD"),
    });

    const isInternalChange = useRef(false);
    const debouncedCustomRange = useDebounce(localCustomRange, 800);
    const periodRef = useRef(period);
    useEffect(() => {
        periodRef.current = period;
    }, [period]);

    useEffect(() => {
        if (!startDate || !endDate) return;
        if (isInternalChange.current) {
            isInternalChange.current = false;
            return;
        }
        setLocalCustomRange({ start: startDate, end: endDate });
        const now = dayjs();
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        const diffDays = end.diff(start, "day");
        let detectedPeriod: typeof period = "custom";
        if (start.isSame(end, "day") && start.isSame(now, "day")) detectedPeriod = "today";
        else if (diffDays === 7 && end.isSame(now, "day")) detectedPeriod = "7d";
        else if (diffDays === 30 && end.isSame(now, "day")) detectedPeriod = "30d";
        else if (start.isSame(now.startOf("month"), "day") && end.isSame(now.endOf("month"), "day")) detectedPeriod = "this_month";
        setPeriod(detectedPeriod);
    }, [startDate, endDate]);

    useEffect(() => {
        if (periodRef.current !== "custom") return;
        if (!debouncedCustomRange.start || !debouncedCustomRange.end) return;
        if (debouncedCustomRange.start > debouncedCustomRange.end) return;
        isInternalChange.current = true;
        onFilterChange(debouncedCustomRange);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedCustomRange]);

    const handlePeriodChange = useCallback(
        (newPeriod: string) => {
            const now = dayjs();
            let range: DateRange;
            switch (newPeriod) {
                case "today":
                    range = { start: now.format("YYYY-MM-DD"), end: now.format("YYYY-MM-DD") };
                    break;
                case "7d":
                    range = { start: now.subtract(7, "day").format("YYYY-MM-DD"), end: now.format("YYYY-MM-DD") };
                    break;
                case "30d":
                    range = { start: now.subtract(30, "day").format("YYYY-MM-DD"), end: now.format("YYYY-MM-DD") };
                    break;
                case "this_month":
                    range = { start: now.startOf("month").format("YYYY-MM-DD"), end: now.endOf("month").format("YYYY-MM-DD") };
                    break;
                case "custom":
                    setPeriod("custom");
                    return;
                default:
                    range = { start: now.subtract(7, "day").format("YYYY-MM-DD"), end: now.format("YYYY-MM-DD") };
            }
            isInternalChange.current = true;
            setPeriod(newPeriod as typeof period);
            onFilterChange(range);
        },
        [onFilterChange],
    );

    if (!data) return <div className="p-8 text-center text-zinc-500">Tidak ada data tersedia</div>;

    const { summary, charts, tables } = data;

    const totalRevenue = toNumber(summary?.total_revenue);
    const totalTx = summary?.total_transactions || 0;
    const aov = totalTx > 0 ? totalRevenue / totalTx : 0;

    const revenueTrend: { date: string; revenue: number }[] = charts?.revenue_trend || [];
    const bestDay = revenueTrend.length > 0 ? revenueTrend.reduce((best, cur) => (toNumber(cur.revenue) > toNumber(best.revenue) ? cur : best)) : null;

    const paymentData = (charts?.revenue_by_method || []).map((item: any) => ({
        name: item.name,
        value: toNumber(item.value),
    }));

    const topBranches = isFiltered
        ? []
        : (charts?.top_branches || []).map((t: any) => ({
              name: t.name,
              revenue: toNumber(t.revenue),
          }));

    const displayedDate = startDate && endDate ? `${dayjs(startDate).format("DD MMM YYYY")} - ${dayjs(endDate).format("DD MMM YYYY")}` : "7 Hari Terakhir";

    return (
        <div className="space-y-6 mt-6 animate-in fade-in duration-500">
            {/* FILTER */}
            <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-500">Periode:</span>
                    <select value={period} onChange={(e) => handlePeriodChange(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-aksen-secondary text-zinc-600">
                        <option value="today">Hari Ini</option>
                        <option value="7d">7 Hari Terakhir</option>
                        <option value="30d">30 Hari Terakhir</option>
                        <option value="this_month">Bulan Ini</option>
                        <option value="custom">Custom Range</option>
                    </select>
                </div>
                {period === "custom" && (
                    <div className="flex items-center gap-2">
                        <input type="date" value={localCustomRange.start} onChange={(e) => setLocalCustomRange((p) => ({ ...p, start: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-zinc-600" />
                        <span className="text-sm text-zinc-600">-</span>
                        <input type="date" value={localCustomRange.end} onChange={(e) => setLocalCustomRange((p) => ({ ...p, end: e.target.value }))} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-zinc-600" />
                    </div>
                )}
            </div>
            <p className="text-xs text-zinc-400 mb-2">{displayedDate}</p>

            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-500/20">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 font-atkin tracking-tighter">Total Pendapatan</p>
                            <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit">{formatRupiah(totalRevenue)}</h3>
                        </div>
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 font-atkin tracking-tighter">Total Transaksi</p>
                            <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit">{totalTx}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <CreditCard size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 font-atkin tracking-tighter">Rata-rata Transaksi</p>
                            <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit">{formatRupiah(aov)}</h3>
                            <p className="text-xs text-zinc-400 mt-1 font-atkin tracking-tighter">Revenue ÷ Transaksi</p>
                        </div>
                        <div className="p-3 bg-violet-50 text-violet-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-zinc-500 font-atkin tracking-tighter">Hari Terbaik</p>
                            <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit">{bestDay?.date ?? "-"}</h3>
                            <p className="text-xs text-zinc-400 mt-1 font-atkin tracking-tighter">{bestDay ? formatRupiah(toNumber(bestDay.revenue)) : "Belum ada data"}</p>
                        </div>
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <Star size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* CHARTS ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-figtree">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-500/20">
                    <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                        <Activity size={18} /> Tren Pendapatan
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} dy={10} />
                                <YAxis tickFormatter={(val) => (val >= 1000000 ? `${val / 1000000}M` : val >= 1000 ? `${val / 1000}K` : `${val}`)} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(val: number) => formatRupiah(toNumber(val))} contentStyle={{ color: "#018790" }} />
                                <Line type="monotone" dataKey="revenue" stroke="#018790" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                    <h2 className="text-lg font-semibold text-zinc-900 mb-4">Metode Pembayaran</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">
                                    {paymentData.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(val: number) => formatRupiah(val)} />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Top 5 Branch */}
                {topBranches.length > 0 && (
                    <div className="bg-white p-6 rounded-xl border border-gray-500/20 md:col-span-2">
                        <h2 className="text-lg font-semibold text-zinc-900 mb-1 flex items-center gap-2">
                            <Building2 size={18} /> Top 5 Cabang by Revenue
                        </h2>
                        <p className="text-xs text-zinc-400 mb-4">Cabang dengan kontribusi pendapatan terbesar</p>
                        <div className="h-64 -ml-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topBranches} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                    <XAxis type="number" tickFormatter={(val) => (val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}K`)} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={110} />
                                    <Tooltip formatter={(val: number) => formatRupiah(val)} />
                                    <Bar dataKey="revenue" fill="#018790" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* TABLE */}
                <div className={`bg-white p-6 rounded-xl border border-gray-500/20 ${topBranches.length > 0 ? "md:col-span-3" : "md:col-span-5"}`}>
                    <h2 className="text-lg font-semibold text-zinc-900 mb-4">Transaksi Terakhir</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                                    <th className="py-3 px-2">Invoice</th>
                                    <th className="py-3 px-2">Member</th>
                                    <th className="py-3 px-2">Cabang</th>
                                    <th className="py-3 px-2">Metode</th>
                                    <th className="py-3 px-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(tables?.recent_transactions || []).length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-6 text-zinc-500">
                                            Tidak ada transaksi di periode ini.
                                        </td>
                                    </tr>
                                ) : (
                                    (tables?.recent_transactions || []).map((tx: any, idx: number) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                            <td className="py-3 px-2 text-zinc-600 font-mono text-xs">{tx.invoice_number}</td>
                                            <td className="py-3 px-2 font-medium text-zinc-900">{tx.member_name}</td>
                                            <td className="py-3 px-2 text-zinc-600 text-xs">{tx.branch_name ?? "-"}</td>
                                            <td className="py-3 px-2">
                                                <span className="uppercase text-xs bg-gray-100 text-zinc-900 px-2 py-1 rounded">{tx.payment_method || "OTHER"}</span>
                                            </td>
                                            <td className="py-3 px-2 text-right font-bold text-zinc-900">{formatRupiah(toNumber(tx.total_amount))}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
