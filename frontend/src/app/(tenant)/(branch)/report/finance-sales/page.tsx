"use client";

import { useState, useCallback } from "react";
import { DollarSign, FileText, Clock, ShoppingBag, BarChart3, TrendingUp } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";
import { useBranchReport } from "@/hooks/tenant/useBranchReport";
import ReportPageLayout from "@/components/pages/branch/report/ReportPageLayout";
import ReportDateFilter from "@/components/pages/branch/report/ReportDateFilter";
import { exportToExcel } from "@/lib/exportExcel";

const COLORS = ["#018790", "#3B82F6", "#8B5CF6", "#F59E0B", "#10B981", "#EF4444"];
const toNumber = (v: unknown) => { const p = parseFloat(String(v ?? 0)); return isNaN(p) ? 0 : p; };
const formatRp = (v: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

type NumericValue = number | string | null | undefined;

interface RevenueTrend {
    date: string;
    revenue: NumericValue;
}

interface RevenueByMethod {
    name: string;
    value: NumericValue;
}

interface TopItem {
    item_type: string;
    item_type_label?: string;
    item_name: string;
    revenue: NumericValue;
    qty: NumericValue;
}

interface RecentTransaction {
    invoice_number: string;
    member_name: string;
    payment_method?: string | null;
    total_amount: NumericValue;
    paid_at: string;
}

export default function FinanceSalesReportPage() {
    const [startDate, setStartDate] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const { data, isLoading, isError } = useBranchReport("finance-sales", startDate, endDate);
    const report = data?.data;

    const handleFilterChange = useCallback((range: { start: string; end: string }) => {
        setStartDate(range.start);
        setEndDate(range.end);
    }, []);

    const summary = report?.summary || {};
    const totalRevenue = summary.total_revenue ?? 0;
    const totalTransactions = summary.total_transactions ?? 0;
    const pendingRevenue = summary.pending_revenue ?? 0;
    const pendingCount = summary.pending_count ?? 0;

    const revenueTrend = (report?.charts?.revenue_trend || []) as RevenueTrend[];
    const revenueByMethod = ((report?.charts?.revenue_by_method || []) as RevenueByMethod[]).map((i) => ({ ...i, value: toNumber(i.value) }));
    const topItems = (report?.charts?.top_items || []) as TopItem[];
    const recentTransactions = (report?.tables?.recent_transactions || []) as RecentTransaction[];

    const [page, setPage] = useState(1);
    const perPage = 5;
    const totalPages = Math.ceil(recentTransactions.length / perPage);
    const currentTransactions = recentTransactions.slice((page - 1) * perPage, page * perPage);

    const handleExportExcel = () => {
        if (!report) return;

        const summaryData = [{
            "Total Pendapatan": totalRevenue,
            "Transaksi Berhasil": totalTransactions,
            "Menunggu Pembayaran (Rp)": pendingRevenue,
            "Menunggu Pembayaran (Qty)": pendingCount,
        }];

        const trendData = revenueTrend.map((t) => ({
            "Tanggal": t.date,
            "Pendapatan": t.revenue
        }));

        const methodData = revenueByMethod.map((m) => ({
            "Metode": m.name,
            "Pendapatan": m.value
        }));

        const topItemsData = topItems.map((i) => ({
            "Item": i.item_name,
            "Tipe": i.item_type_label || i.item_type,
            "Terjual": i.qty,
            "Pendapatan": i.revenue
        }));

        const txData = recentTransactions.map((tx) => ({
            "Invoice": tx.invoice_number,
            "Member": tx.member_name,
            "Metode": tx.payment_method,
            "Total": tx.total_amount,
            "Waktu": dayjs(tx.paid_at).format("YYYY-MM-DD HH:mm:ss")
        }));

        exportToExcel([
            { sheetName: "Ringkasan", data: summaryData },
            { sheetName: "Tren Harian", data: trendData },
            { sheetName: "Metode Pembayaran", data: methodData },
            { sheetName: "Top Items", data: topItemsData },
            { sheetName: "Transaksi", data: txData },
        ], `Laporan_Keuangan_${startDate}_${endDate}`);
    };

    return (
        <ReportPageLayout
            title="Laporan Keuangan & Penjualan"
            description="Ringkasan pendapatan dan riwayat transaksi"
            icon={<DollarSign size={22} />}
            isLoading={isLoading}
            isError={isError}
            onExportExcel={handleExportExcel}
            filterSlot={<ReportDateFilter startDate={startDate} endDate={endDate} onFilterChange={handleFilterChange} />}
        >
            {report && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><TrendingUp size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Total Pendapatan</p>
                                <h3 className="text-xl font-bold text-zinc-900">{formatRp(totalRevenue)}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><FileText size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Transaksi Berhasil</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{totalTransactions}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Clock size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Menunggu Pembayaran (Qty)</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{pendingCount}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><DollarSign size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Menunggu Pembayaran (Rp)</p>
                                <h3 className="text-xl font-bold text-zinc-900">{formatRp(pendingRevenue)}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Area Chart */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-500/20">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                <BarChart3 size={18} /> Tren Pendapatan Harian
                            </h2>
                            <div className="h-64">
                                {revenueTrend.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-zinc-400 text-sm">Tidak ada data pendapatan di periode ini.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={revenueTrend} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} dy={10} />
                                            <YAxis 
                                                tickLine={false} 
                                                axisLine={false} 
                                                tick={{ fontSize: 12, fill: "#6B7280" }} 
                                                tickFormatter={(value) => `Rp${(value/1000000).toFixed(1)}M`} 
                                            />
                                            <Tooltip formatter={(val: unknown) => formatRp(toNumber(val))} />
                                            <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {/* Pie Chart */}
                        {revenueByMethod.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Metode Pembayaran</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={revenueByMethod} 
                                                cx="50%" 
                                                cy="50%" 
                                                innerRadius={60} 
                                                outerRadius={80} 
                                                paddingAngle={5} 
                                                dataKey="value" 
                                                nameKey="name"
                                            >
                                                {revenueByMethod.map((_, i) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val: unknown) => formatRp(toNumber(val))} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", textTransform: "capitalize" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top Items Table */}
                        {topItems.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <ShoppingBag size={18} /> Item Paling Laris (Top Sales)
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                                                <th className="py-3 px-2">Item</th>
                                                <th className="py-3 px-2">Tipe</th>
                                                <th className="py-3 px-2 text-right">Terjual</th>
                                                <th className="py-3 px-2 text-right">Pendapatan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topItems.map((m, i) => (
                                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                                    <td className="py-3 px-2 font-medium text-zinc-900">{m.item_name}</td>
                                                    <td className="py-3 px-2 text-zinc-500 text-xs">{m.item_type_label || m.item_type}</td>
                                                    <td className="py-3 px-2 text-right font-semibold text-blue-600">{m.qty}x</td>
                                                    <td className="py-3 px-2 text-right text-green-600 font-medium">
                                                        {formatRp(m.revenue)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Recent Transactions */}
                        {recentTransactions.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <FileText size={18} /> Transaksi Terbaru
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                                                <th className="py-3 px-2">Invoice</th>
                                                <th className="py-3 px-2">Member</th>
                                                <th className="py-3 px-2 text-right">Waktu</th>
                                                <th className="py-3 px-2 text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentTransactions.map((m, i) => (
                                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                                    <td className="py-3 px-2 text-xs font-mono text-zinc-500">{m.invoice_number}</td>
                                                    <td className="py-3 px-2 font-medium text-zinc-900">{m.member_name}</td>
                                                    <td className="py-3 px-2 text-right text-zinc-500 text-xs">
                                                        {dayjs(m.paid_at).format("DD/MM/YY HH:mm")}
                                                    </td>
                                                    <td className="py-3 px-2 text-right font-medium text-zinc-900">
                                                        {formatRp(m.total_amount)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                        <span className="text-xs text-zinc-500">
                                            Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, recentTransactions.length)} dari {recentTransactions.length}
                                        </span>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => setPage(p => Math.max(p - 1, 1))} 
                                                disabled={page === 1} 
                                                className="px-3 py-1.5 text-xs font-semibold text-zinc-600 bg-white border border-gray-200 rounded-md disabled:opacity-50"
                                            >
                                                Prev
                                            </button>
                                            <button 
                                                onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
                                                disabled={page === totalPages} 
                                                className="px-3 py-1.5 text-xs font-semibold text-zinc-600 bg-white border border-gray-200 rounded-md disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </ReportPageLayout>
    );
}
