"use client";

import { useState, useCallback } from "react";
import { User, CheckCircle2, XCircle, Percent, Trophy } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";
import { useBranchReport } from "@/hooks/tenant/useBranchReport";
import ReportPageLayout from "@/components/pages/branch/report/ReportPageLayout";
import ReportDateFilter from "@/components/pages/branch/report/ReportDateFilter";
import { exportToExcel } from "@/lib/exportExcel";
import { exportToPdf, buildPdfFilename } from "@/lib/exportPdf";

const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#3B82F6"];
const toNumber = (v: any) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };

export default function PtSessionsReportPage() {
    const [startDate, setStartDate] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const { data, isLoading, isError } = useBranchReport("pt-sessions", startDate, endDate);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const report = data?.data;

    const handleFilterChange = useCallback((range: { start: string; end: string }) => {
        setStartDate(range.start);
        setEndDate(range.end);
    }, []);

    const summary = report?.summary || {};
    const totalSessions = summary.total_sessions ?? 0;
    const completedSessions = summary.completed_sessions ?? 0;
    const cancelledSessions = summary.cancelled_sessions ?? 0;
    const completionRate = summary.completion_rate ?? 0;

    const statusDistribution = (report?.charts?.status_distribution || []).map((i: any) => ({ ...i, value: toNumber(i.value) }));
    const trainerUtilization = report?.tables?.trainer_utilization || [];

    const handleExportExcel = () => {
        if (!report) return;

        const summaryData = [{
            "Total Sesi": totalSessions,
            "Selesai": completedSessions,
            "Dibatalkan": cancelledSessions,
            "Penyelesaian (%)": completionRate,
        }];

        const statusData = statusDistribution.map((s: any) => ({
            "Status": s.name,
            "Jumlah": s.value
        }));

        const trainerData = trainerUtilization.map((t: any) => ({
            "Nama Pelatih": t.name,
            "Total Sesi": t.total_sessions,
            "Selesai": t.completed,
            "Persentase Selesai": t.total_sessions > 0 ? ((t.completed / t.total_sessions) * 100).toFixed(1) : 0
        }));

        exportToExcel([
            { sheetName: "Ringkasan", data: summaryData },
            { sheetName: "Status Sesi", data: statusData },
            { sheetName: "Beban Pelatih", data: trainerData },
        ], `Laporan_PT_Sessions_${startDate}_${endDate}`);
    };

    const handleExportPdf = async () => {
        if (!report) return;
        setIsExportingPdf(true);
        try {
            await exportToPdf({
                title: "Laporan Sesi PT",
                subtitle: `Periode: ${startDate} s.d ${endDate}`,
                filename: buildPdfFilename("PT_Sessions", startDate, endDate),
                summary: [
                    { label: "Total Sesi", value: String(totalSessions) },
                    { label: "Selesai", value: String(completedSessions) },
                    { label: "Dibatalkan", value: String(cancelledSessions) },
                    { label: "Penyelesaian", value: `${completionRate}%` },
                ],
                tables: [
                    {
                        title: "Status Sesi PT",
                        columns: [
                            { header: "Status", key: "name" },
                            { header: "Jumlah", key: "value", align: "right" as const },
                        ],
                        rows: statusDistribution.map((s: any) => ({
                            name: s.name,
                            value: String(s.value),
                        })),
                    },
                    {
                        title: "Beban Kerja Pelatih (Trainer Utilization)",
                        columns: [
                            { header: "Nama Pelatih", key: "name" },
                            { header: "Total Sesi", key: "total_sessions", align: "right" as const },
                            { header: "Sesi Selesai", key: "completed", align: "right" as const },
                            { header: "Persentase Selesai", key: "completion_rate", align: "right" as const },
                        ],
                        rows: trainerUtilization.map((t: any) => ({
                            name: t.name,
                            total_sessions: String(t.total_sessions),
                            completed: String(t.completed),
                            completion_rate: t.total_sessions > 0
                                ? `${((t.completed / t.total_sessions) * 100).toFixed(1)}%`
                                : "0%",
                        })),
                    },
                ],
            });
        } catch (e) {
            console.error("PDF export gagal:", e);
        } finally {
            setIsExportingPdf(false);
        }
    };

    return (
        <ReportPageLayout
            title="Laporan Sesi PT"
            description="Performa pelatih dan penyelesaian sesi Personal Training"
            icon={<User size={22} />}
            isLoading={isLoading}
            isError={isError}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
            filterSlot={<ReportDateFilter startDate={startDate} endDate={endDate} onFilterChange={handleFilterChange} />}
        >
            {report && (
                <div id="report-content-pt-sessions" className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><User size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Total Sesi</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{totalSessions}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Selesai</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{completedSessions}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg"><XCircle size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Dibatalkan</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{cancelledSessions}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Percent size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Penyelesaian</p>
                                <h3 className={`text-2xl font-bold ${completionRate >= 80 ? "text-green-600" : completionRate >= 60 ? "text-orange-500" : "text-red-600"}`}>
                                    {completionRate}%
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Charts */}
                        {statusDistribution.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20 lg:col-span-1">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Status Sesi PT</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={statusDistribution} 
                                                cx="50%" 
                                                cy="50%" 
                                                innerRadius={60} 
                                                outerRadius={80} 
                                                paddingAngle={5} 
                                                dataKey="value" 
                                                nameKey="name"
                                            >
                                                {statusDistribution.map((_: any, i: number) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val: number) => `${val} sesi`} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        {trainerUtilization.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20 lg:col-span-2">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <Trophy size={18} className="text-yellow-500" /> Beban Kerja Pelatih (Trainer Utilization)
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                                                <th className="py-3 px-2">Nama Pelatih</th>
                                                <th className="py-3 px-2 text-right">Total Sesi (Dijadwalkan)</th>
                                                <th className="py-3 px-2 text-right">Sesi Selesai</th>
                                                <th className="py-3 px-2 text-right">Persentase Selesai</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trainerUtilization.map((m: any, i: number) => {
                                                const rate = m.total_sessions > 0 ? ((m.completed / m.total_sessions) * 100).toFixed(1) : 0;
                                                return (
                                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                                        <td className="py-3 px-2 font-medium text-zinc-900">{m.name}</td>
                                                        <td className="py-3 px-2 text-right text-blue-600 font-medium">{m.total_sessions}</td>
                                                        <td className="py-3 px-2 text-right text-green-600 font-medium">{m.completed}</td>
                                                        <td className="py-3 px-2 text-right">
                                                            <span className={`text-xs font-semibold px-2 py-1 rounded ${Number(rate) >= 80 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                                                                {rate}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </ReportPageLayout>
    );
}
