"use client";

import { useState, useCallback } from "react";
import {
    BarChart3,
    ScanLine,
    Dumbbell,
    DollarSign,
    CalendarCheck,
    XCircle,
    AlertCircle,
    Eye,
    TrendingUp,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import dayjs from "dayjs";
import { useMemberReportSummary } from "@/hooks/tenant/useMemberReports";
import ReportDateFilter from "@/components/pages/branch/report/ReportDateFilter";
import { exportToPdf, buildPdfFilename, formatRpForPdf } from "@/lib/exportPdf";

const mapItemType = (type: string) => {
    const cleanType = type.split("\\").pop() || type;
    switch (cleanType) {
        case "MembershipPlan":
            return "Membership";
        case "PtSessionPlan":
            return "Personal Trainer (PT)";
        case "Product":
            return "Produk / POS";
        case "ClassPlan":
            return "Kelas";
        default:
            return cleanType.replace(/([A-Z])/g, ' $1').trim();
    }
};

const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(n);

export default function MemberReportsPage() {
    const [startDate, setStartDate] = useState(
        dayjs().subtract(6, "month").startOf("month").format("YYYY-MM-DD")
    );
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));

    const { data, isLoading, isError } = useMemberReportSummary(
        startDate,
        endDate
    );

    const handleFilterChange = useCallback(
        (range: { start: string; end: string }) => {
            setStartDate(range.start);
            setEndDate(range.end);
        },
        []
    );

    const report = data;

    const handleExportPdf = () => {
        if (!report) return;

        const summary = [
            { label: "Total Check-in", value: `${report.checkin_stats.total_checkins} kali` },
            { label: "Total Kelas", value: `${report.class_summary.total} kelas` },
            { label: "Kelas Hadir", value: `${report.class_summary.attended} kelas` },
            { label: "Total Pengeluaran", value: formatRpForPdf(report.spending_summary.total_spent) },
        ];

        const classRows = [
            { status: "Hadir", count: `${report.class_summary.attended} kelas` },
            { status: "Batal", count: `${report.class_summary.cancelled} kelas` },
            { status: "No Show", count: `${report.class_summary.no_show} kelas` },
        ];

        const spendingRows = Object.entries(report.spending_summary.breakdown).map(([type, item]: [string, any]) => ({
            type: mapItemType(type),
            amount: formatRpForPdf(item.amount),
        }));

        const trendRows = report.checkin_trend.map((item: any) => ({
            month: item.month,
            count: `${item.count} kali`,
        }));

        const tables = [
            {
                title: "Detail Kehadiran Kelas",
                columns: [
                    { header: "Status Kehadiran", key: "status" },
                    { header: "Jumlah Sesi", key: "count", align: "right" as const },
                ],
                rows: classRows,
            },
            {
                title: "Detail Pengeluaran",
                columns: [
                    { header: "Jenis Transaksi", key: "type" },
                    { header: "Total Pengeluaran", key: "amount", align: "right" as const },
                ],
                rows: spendingRows,
            },
            {
                title: "Tren Check-in Bulanan",
                columns: [
                    { header: "Bulan", key: "month" },
                    { header: "Jumlah Check-in", key: "count", align: "right" as const },
                ],
                rows: trendRows,
            },
        ];

        exportToPdf({
            title: "Laporan Aktivitas Member",
            subtitle: `Periode: ${dayjs(startDate).format("DD MMM YYYY")} s.d ${dayjs(endDate).format("DD MMM YYYY")}`,
            filename: buildPdfFilename("Aktivitas_Member", startDate, endDate),
            summary,
            tables,
        });
    };

    return (
        <div className="space-y-6 font-figtree pb-10 bg-white p-5 rounded-xl border border-gray-500/20">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart3 size={22} className="text-zinc-700" />
                        <h1 className="text-2xl font-bold text-zinc-900">
                            Laporan Aktivitas
                        </h1>
                    </div>
                    <p className="text-sm text-zinc-500">
                        Ringkasan aktivitas gym Anda.
                    </p>
                </div>

                {report && (
                    <button
                        type="button"
                        onClick={handleExportPdf}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors shadow-sm self-start md:self-center"
                    >
                        Export PDF
                    </button>
                )}
            </div>

            {/* Filter */}
            <div className="mb-6">
                <ReportDateFilter
                    startDate={startDate}
                    endDate={endDate}
                    onFilterChange={handleFilterChange}
                />
            </div>

            {/* Content */}
            <div>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                                <div className="flex gap-1.5 mb-4">
                                    <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                    <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                    <div className="w-2.5 h-2.5 bg-teal-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                                <p className="text-sm font-medium">
                                    Mengambil data laporan...
                                </p>
                            </div>
                        ) : isError ? (
                            <div className="flex items-center justify-center h-64 bg-red-50 rounded-2xl border border-red-100">
                                <div className="text-center">
                                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                                    <p className="text-red-600 font-medium">
                                        Gagal memuat laporan.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            report && (
                                <div className="space-y-8">
                                    {/* ========== CHECK-IN TREND ========== */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-5">
                                            <ScanLine className="w-5 h-5 text-teal-500" />
                                            <h2 className="text-base font-black text-zinc-900 uppercase tracking-wider">
                                                Tren Check-in
                                            </h2>
                                        </div>
                                        <div className="bg-zinc-50/50 border border-zinc-200 rounded-2xl p-5">
                                            {/* Stats row */}
                                            <div className="flex items-center gap-6 mb-6">
                                                <div>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                        Total Check-in
                                                    </p>
                                                    <p className="text-3xl font-black text-zinc-900 tracking-tight">
                                                        {report.checkin_stats
                                                            .total_checkins}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Chart */}
                                            {report.checkin_trend.length > 0 ? (
                                                <div className="h-56">
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                    >
                                                        <BarChart
                                                            data={
                                                                report.checkin_trend
                                                            }
                                                            margin={{
                                                                top: 5,
                                                                right: 10,
                                                                bottom: 5,
                                                                left: 0,
                                                            }}
                                                        >
                                                            <CartesianGrid
                                                                strokeDasharray="3 3"
                                                                vertical={false}
                                                                stroke="#E5E7EB"
                                                            />
                                                            <XAxis
                                                                dataKey="month"
                                                                tickLine={false}
                                                                axisLine={false}
                                                                tick={{
                                                                    fontSize: 11,
                                                                    fill: "#9CA3AF",
                                                                }}
                                                            />
                                                            <YAxis
                                                                tickLine={false}
                                                                axisLine={false}
                                                                tick={{
                                                                    fontSize: 11,
                                                                    fill: "#9CA3AF",
                                                                }}
                                                                allowDecimals={
                                                                    false
                                                                }
                                                            />
                                                            <Tooltip
                                                                formatter={(
                                                                    value: number
                                                                ) => [
                                                                    `${value} kali`,
                                                                    "Check-in",
                                                                ]}
                                                                contentStyle={{
                                                                    borderRadius:
                                                                        "12px",
                                                                    border: "1px solid #E5E7EB",
                                                                    boxShadow:
                                                                        "0 4px 6px -1px rgba(0,0,0,0.1)",
                                                                    fontSize:
                                                                        "12px",
                                                                }}
                                                            />
                                                            <Bar
                                                                dataKey="count"
                                                                radius={[
                                                                    6, 6, 0, 0,
                                                                ]}
                                                                maxBarSize={48}
                                                            >
                                                                {report.checkin_trend.map(
                                                                    (
                                                                        _: any,
                                                                        i: number
                                                                    ) => (
                                                                        <Cell
                                                                            key={i}
                                                                            fill={
                                                                                i ===
                                                                                report
                                                                                    .checkin_trend
                                                                                    .length -
                                                                                    1
                                                                                    ? "#0f766e"
                                                                                    : "#99f6e4"
                                                                            }
                                                                        />
                                                                    )
                                                                )}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            ) : (
                                                <div className="h-40 flex items-center justify-center text-sm text-zinc-400">
                                                    Belum ada data check-in.
                                                </div>
                                            )}
                                        </div>
                                    </section>

                                    {/* ========== CLASS ATTENDANCE SUMMARY ========== */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-5">
                                            <Dumbbell className="w-5 h-5 text-violet-500" />
                                            <h2 className="text-base font-black text-zinc-900 uppercase tracking-wider">
                                                Kehadiran Kelas
                                            </h2>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <StatCard
                                                icon={
                                                    <CalendarCheck className="w-5 h-5" />
                                                }
                                                label="Total Kelas"
                                                value={
                                                    report.class_summary.total
                                                }
                                                color="blue"
                                            />
                                            <StatCard
                                                icon={
                                                    <TrendingUp className="w-5 h-5" />
                                                }
                                                label="Hadir"
                                                value={
                                                    report.class_summary.attended
                                                }
                                                color="teal"
                                            />
                                            <StatCard
                                                icon={
                                                    <XCircle className="w-5 h-5" />
                                                }
                                                label="Batal"
                                                value={
                                                    report.class_summary
                                                        .cancelled
                                                }
                                                color="red"
                                            />
                                            <StatCard
                                                icon={
                                                    <Eye className="w-5 h-5" />
                                                }
                                                label="No Show"
                                                value={
                                                    report.class_summary.no_show
                                                }
                                                color="amber"
                                            />
                                        </div>

                                        {/* Attendance rate bar */}
                                        {report.class_summary.total > 0 && (
                                            <div className="mt-4 bg-zinc-50 rounded-xl p-4 border border-zinc-200">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                                        Tingkat Kehadiran
                                                    </span>
                                                    <span className="text-sm font-black text-teal-600">
                                                        {Math.round(
                                                            (report
                                                                .class_summary
                                                                .attended /
                                                                report
                                                                    .class_summary
                                                                    .total) *
                                                                100
                                                        )}
                                                        %
                                                    </span>
                                                </div>
                                                <div className="h-2.5 bg-zinc-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-teal-500 rounded-full transition-all duration-700"
                                                        style={{
                                                            width: `${Math.round(
                                                                (report
                                                                    .class_summary
                                                                    .attended /
                                                                    report
                                                                        .class_summary
                                                                        .total) *
                                                                    100
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </section>

                                    {/* ========== SPENDING SUMMARY ========== */}
                                    <section>
                                        <div className="flex items-center gap-2 mb-5">
                                            <DollarSign className="w-5 h-5 text-emerald-500" />
                                            <h2 className="text-base font-black text-zinc-900 uppercase tracking-wider">
                                                Ringkasan Pengeluaran
                                            </h2>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-6 border border-zinc-700">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                                    Total Pengeluaran
                                                </p>
                                                <p className="text-3xl font-black text-white tracking-tight">
                                                    {formatRupiah(
                                                        report.spending_summary
                                                            .total_spent
                                                    )}
                                                </p>
                                                <p className="text-xs text-zinc-500 mt-1">
                                                    {
                                                        report.spending_summary
                                                            .total_transactions
                                                    }{" "}
                                                    transaksi
                                                </p>
                                            </div>
                                            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                                                    Breakdown
                                                </p>
                                                {Object.keys(
                                                    report.spending_summary
                                                        .breakdown
                                                ).length === 0 ? (
                                                    <p className="text-sm text-zinc-400">
                                                        Belum ada transaksi.
                                                    </p>
                                                ) : (
                                                    <div className="space-y-3">
                                                        {Object.entries(
                                                            report
                                                                .spending_summary
                                                                .breakdown
                                                        ).map(
                                                            ([
                                                                type,
                                                                item,
                                                            ]) => (
                                                                <div
                                                                    key={type}
                                                                    className="flex items-center justify-between"
                                                                >
                                                                    <span className="text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                                                        {mapItemType(type)}
                                                                    </span>
                                                                    <span className="text-sm font-bold text-zinc-900">
                                                                        {formatRupiah(
                                                                            (
                                                                                item as any
                                                                            )
                                                                                .amount
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )
                        )}
                    </div>
        </div>
    );
}

// ========== STAT CARD ==========
function StatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    color: string;
}) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600",
        teal: "bg-teal-50 text-teal-600",
        red: "bg-red-50 text-red-600",
        amber: "bg-amber-50 text-amber-600",
        violet: "bg-violet-50 text-violet-600",
    };

    return (
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
            <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                    colorMap[color] || colorMap.blue
                }`}
            >
                {icon}
            </div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                {label}
            </p>
            <p className="text-2xl font-black text-zinc-900">{value}</p>
        </div>
    );
}
