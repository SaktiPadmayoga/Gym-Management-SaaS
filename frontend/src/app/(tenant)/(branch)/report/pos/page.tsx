"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { AlertTriangle, BarChart3, Boxes, CreditCard, DollarSign, Package, Receipt, ShoppingCart, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import dayjs from "dayjs";
import { useBranchReport } from "@/hooks/tenant/useBranchReport";
import ReportDateFilter from "@/components/pages/branch/report/ReportDateFilter";
import ReportPageLayout from "@/components/pages/branch/report/ReportPageLayout";
import { exportToExcel } from "@/lib/exportExcel";

const COLORS = ["#018790", "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];
const toNumber = (v: unknown) => {
    const parsed = parseFloat(String(v ?? 0));
    return Number.isNaN(parsed) ? 0 : parsed;
};
const formatRp = (v: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);

type NumericValue = number | string | null | undefined;

interface DailyProductSale {
    date: string;
    revenue: NumericValue;
    qty: NumericValue;
}

interface ValuePoint {
    name: string;
    value: NumericValue;
}

interface TopProduct {
    item_name: string;
    category: string;
    qty: NumericValue;
    revenue: NumericValue;
    gross_profit: NumericValue;
}

interface LowStockProduct {
    name: string;
    code?: string | null;
    category: string;
    stock: NumericValue;
    min_stock: NumericValue;
    unit: string;
}

interface RecentTransaction {
    invoice_number: string;
    customer_name: string;
    payment_method?: string | null;
    total_amount: NumericValue;
    paid_at: string;
}

export default function PosReportPage() {
    const [startDate, setStartDate] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const { data, isLoading, isError } = useBranchReport("pos", startDate, endDate);
    const report = data?.data;

    const handleFilterChange = useCallback((range: { start: string; end: string }) => {
        setStartDate(range.start);
        setEndDate(range.end);
    }, []);

    const summary = report?.summary || {};
    const dailySales = (report?.charts?.daily_product_sales || []) as DailyProductSale[];
    const salesByCategory = ((report?.charts?.sales_by_category || []) as ValuePoint[]).map((i) => ({ ...i, value: toNumber(i.value) }));
    const paymentMethods = ((report?.charts?.payment_methods || []) as ValuePoint[]).map((i) => ({ ...i, value: toNumber(i.value) }));
    const topProducts = (report?.tables?.top_products || []) as TopProduct[];
    const lowStockProducts = (report?.tables?.low_stock_products || []) as LowStockProduct[];
    const recentTransactions = (report?.tables?.recent_transactions || []) as RecentTransaction[];

    const handleExportExcel = () => {
        if (!report) return;

        exportToExcel([
            {
                sheetName: "Ringkasan",
                data: [{
                    "Pendapatan Produk": summary.total_revenue || 0,
                    "Transaksi POS": summary.total_transactions || 0,
                    "Produk Terjual": summary.units_sold || 0,
                    "Rata-rata Order": summary.average_order_value || 0,
                    "Estimasi Profit Kotor": summary.gross_profit || 0,
                    "Margin Kotor (%)": summary.gross_margin || 0,
                    "Stok Rendah": summary.low_stock_count || 0,
                    "Stok Habis": summary.out_of_stock_count || 0,
                }],
            },
            { sheetName: "Tren Harian", data: dailySales.map((i) => ({ Tanggal: i.date, Pendapatan: i.revenue, "Qty Terjual": i.qty })) },
            { sheetName: "Kategori", data: salesByCategory.map((i) => ({ Kategori: i.name, Pendapatan: i.value })) },
            { sheetName: "Metode Bayar", data: paymentMethods.map((i) => ({ Metode: i.name, Total: i.value })) },
            { sheetName: "Top Produk", data: topProducts.map((i) => ({ Produk: i.item_name, Kategori: i.category, Qty: i.qty, Pendapatan: i.revenue, "Profit Kotor": i.gross_profit })) },
            { sheetName: "Stok Rendah", data: lowStockProducts.map((i) => ({ Produk: i.name, Kode: i.code, Kategori: i.category, Stok: i.stock, Minimum: i.min_stock, Unit: i.unit })) },
            { sheetName: "Transaksi", data: recentTransactions.map((i) => ({ Invoice: i.invoice_number, Pelanggan: i.customer_name, Metode: i.payment_method, Total: i.total_amount, Waktu: dayjs(i.paid_at).format("YYYY-MM-DD HH:mm:ss") })) },
        ], `Laporan_POS_Produk_${startDate}_${endDate}`);
    };

    return (
        <ReportPageLayout
            title="Laporan POS & Produk"
            description="Performa penjualan produk, margin, metode bayar, dan stok"
            icon={<ShoppingCart size={22} />}
            isLoading={isLoading}
            isError={isError}
            onExportExcel={handleExportExcel}
            filterSlot={<ReportDateFilter startDate={startDate} endDate={endDate} onFilterChange={handleFilterChange} />}
        >
            {report && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                        <SummaryCard icon={<DollarSign size={22} />} label="Pendapatan Produk" value={formatRp(toNumber(summary.total_revenue))} tone="green" />
                        <SummaryCard icon={<Receipt size={22} />} label="Transaksi POS" value={summary.total_transactions ?? 0} tone="blue" />
                        <SummaryCard icon={<Boxes size={22} />} label="Produk Terjual" value={summary.units_sold ?? 0} tone="teal" />
                        <SummaryCard icon={<TrendingUp size={22} />} label="Rata-rata Order" value={formatRp(toNumber(summary.average_order_value))} tone="violet" />
                        <SummaryCard icon={<BarChart3 size={22} />} label="Profit Kotor" value={formatRp(toNumber(summary.gross_profit))} tone="emerald" />
                        <SummaryCard icon={<CreditCard size={22} />} label="Margin Kotor" value={`${summary.gross_margin ?? 0}%`} tone="cyan" />
                        <SummaryCard icon={<AlertTriangle size={22} />} label="Stok Rendah" value={summary.low_stock_count ?? 0} tone="amber" />
                        <SummaryCard icon={<Package size={22} />} label="Stok Habis" value={summary.out_of_stock_count ?? 0} tone="red" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2 bg-white p-6 rounded-xl border border-gray-500/20">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2"><BarChart3 size={18} /> Tren Penjualan Produk</h2>
                            <div className="h-72">
                                {dailySales.length === 0 ? (
                                    <EmptyState text="Belum ada penjualan produk pada periode ini." />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={dailySales} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}M`} />
                                            <Tooltip formatter={(val: unknown, name: unknown) => name === "revenue" ? formatRp(toNumber(val)) : toNumber(val)} />
                                            <Area type="monotone" dataKey="revenue" name="Pendapatan" stroke="#10B981" fill="#10B981" fillOpacity={0.16} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Metode Pembayaran</h2>
                            <div className="h-72">
                                {paymentMethods.length === 0 ? (
                                    <EmptyState text="Belum ada pembayaran POS." />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={paymentMethods} cx="50%" cy="50%" innerRadius={58} outerRadius={82} dataKey="value" nameKey="name" paddingAngle={4}>
                                                {paymentMethods.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(val: unknown) => formatRp(toNumber(val))} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", textTransform: "capitalize" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Penjualan per Kategori</h2>
                            <div className="h-72">
                                {salesByCategory.length === 0 ? (
                                    <EmptyState text="Belum ada data kategori." />
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={salesByCategory} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} tickFormatter={(value) => `Rp${(value / 1000000).toFixed(1)}M`} />
                                            <Tooltip formatter={(val: unknown) => formatRp(toNumber(val))} />
                                            <Bar dataKey="value" name="Pendapatan" fill="#018790" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        <ReportTable title="Top Produk" columns={["Produk", "Kategori", "Qty", "Pendapatan", "Profit"]}>
                            {topProducts.map((item, i) => (
                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                    <td className="py-3 px-2 font-medium text-zinc-900">{item.item_name}</td>
                                    <td className="py-3 px-2 text-zinc-500">{item.category}</td>
                                    <td className="py-3 px-2 text-right font-semibold text-blue-600">{item.qty}</td>
                                    <td className="py-3 px-2 text-right font-medium text-green-600">{formatRp(toNumber(item.revenue))}</td>
                                    <td className="py-3 px-2 text-right font-medium text-zinc-900">{formatRp(toNumber(item.gross_profit))}</td>
                                </tr>
                            ))}
                        </ReportTable>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <ReportTable title="Produk Stok Rendah" columns={["Produk", "Kode", "Kategori", "Stok"]}>
                            {lowStockProducts.map((item, i) => (
                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                    <td className="py-3 px-2 font-medium text-zinc-900">{item.name}</td>
                                    <td className="py-3 px-2 text-xs font-mono text-zinc-500">{item.code || "-"}</td>
                                    <td className="py-3 px-2 text-zinc-500">{item.category}</td>
                                    <td className="py-3 px-2 text-right font-semibold text-amber-600">{item.stock} / {item.min_stock} {item.unit}</td>
                                </tr>
                            ))}
                        </ReportTable>

                        <ReportTable title="Transaksi POS Terbaru" columns={["Invoice", "Pelanggan", "Metode", "Total"]}>
                            {recentTransactions.map((item, i) => (
                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                    <td className="py-3 px-2 text-xs font-mono text-zinc-500">{item.invoice_number}</td>
                                    <td className="py-3 px-2 font-medium text-zinc-900">{item.customer_name}</td>
                                    <td className="py-3 px-2 text-zinc-500 capitalize">{item.payment_method || "-"}</td>
                                    <td className="py-3 px-2 text-right font-medium text-zinc-900">{formatRp(toNumber(item.total_amount))}</td>
                                </tr>
                            ))}
                        </ReportTable>
                    </div>
                </div>
            )}
        </ReportPageLayout>
    );
}

function SummaryCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: ReactNode; tone: string }) {
    const tones: Record<string, string> = {
        green: "bg-green-50 text-green-600",
        blue: "bg-blue-50 text-blue-600",
        teal: "bg-teal-50 text-teal-600",
        violet: "bg-violet-50 text-violet-600",
        emerald: "bg-emerald-50 text-emerald-600",
        cyan: "bg-cyan-50 text-cyan-600",
        amber: "bg-amber-50 text-amber-600",
        red: "bg-red-50 text-red-600",
    };

    return (
        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${tones[tone] || tones.blue}`}>{icon}</div>
            <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-500">{label}</p>
                <h3 className="text-xl font-bold text-zinc-900 truncate">{value}</h3>
            </div>
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return <div className="flex items-center justify-center h-full text-sm text-zinc-400">{text}</div>;
}

function ReportTable({ title, columns, children }: { title: string; columns: string[]; children: ReactNode }) {
    const hasRows = Array.isArray(children) ? children.length > 0 : Boolean(children);

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">{title}</h2>
            {hasRows ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                                {columns.map((column, index) => (
                                    <th key={column} className={`py-3 px-2 ${index >= 2 ? "text-right" : ""}`}>{column}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>{children}</tbody>
                    </table>
                </div>
            ) : (
                <div className="flex items-center justify-center h-36 text-sm text-zinc-400">Tidak ada data.</div>
            )}
        </div>
    );
}
