"use client";

import { useState, useCallback } from "react";
import { CreditCard, PauseCircle, AlertCircle, PieChart as PieChartIcon } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";
import { useBranchReport } from "@/hooks/tenant/useBranchReport";
import ReportPageLayout from "@/components/pages/branch/report/ReportPageLayout";
import ReportDateFilter from "@/components/pages/branch/report/ReportDateFilter";
import { exportToExcel } from "@/lib/exportExcel";
import { exportToPdf, buildPdfFilename } from "@/lib/exportPdf";

const COLORS = ["#018790", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444"];
const toNumber = (v: any) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };

export default function MembershipReportPage() {
    const [startDate, setStartDate] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const { data, isLoading, isError } = useBranchReport("membership", startDate, endDate);
    const report = data?.data;

    const handleFilterChange = useCallback((range: { start: string; end: string }) => {
        setStartDate(range.start);
        setEndDate(range.end);
    }, []);

    const summary = report?.summary || {};
    const activeCount = summary.active_count ?? 0;
    const frozenCount = summary.frozen_count ?? 0;
    const expiredCount = summary.expired_count ?? 0;

    const planDistribution = (report?.charts?.plan_distribution || []).map((i: any) => ({ ...i, value: toNumber(i.value) }));
    const expiringSoonList = report?.tables?.expiring_soon || [];

    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [page, setPage] = useState(1);
    const perPage = 10;
    const totalPages = Math.ceil(expiringSoonList.length / perPage);
    const currentExpiring = expiringSoonList.slice((page - 1) * perPage, page * perPage);

    const handleExportExcel = () => {
        if (!report) return;

        const summaryData = [{
            "Aktif": activeCount,
            "Dibekukan": frozenCount,
            "Kedaluwarsa": expiredCount,
        }];

        const distData = planDistribution.map((p: any) => ({
            "Paket": p.name,
            "Jumlah": p.value
        }));

        const expiringData = expiringSoonList.map((m: any) => ({
            "Member": m.member_name,
            "Paket": m.plan_name,
            "Tanggal Berakhir": m.ends_at,
            "Sisa Hari": m.days_left
        }));

        exportToExcel([
            { sheetName: "Ringkasan", data: summaryData },
            { sheetName: "Distribusi Paket", data: distData },
            { sheetName: "Akan Kedaluwarsa", data: expiringData },
        ], `Laporan_Membership_${startDate}_${endDate}`);
    };

    const handleExportPdf = async () => {
        if (!report) return;
        setIsExportingPdf(true);
        try {
            await exportToPdf({
                title: "Laporan Membership",
                subtitle: `Periode: ${startDate} s.d ${endDate}`,
                filename: buildPdfFilename("Membership", startDate, endDate),
                summary: [
                    { label: "Membership Aktif", value: activeCount.toLocaleString("id-ID") },
                    { label: "Membership Dibekukan", value: frozenCount.toLocaleString("id-ID") },
                    { label: "Kedaluwarsa di Periode Ini", value: expiredCount.toLocaleString("id-ID") },
                ],
                tables: [
                    {
                        title: "Distribusi Paket Membership (Aktif)",
                        columns: [
                            { header: "Paket", key: "name" },
                            { header: "Jumlah Member", key: "value", align: "right" as const },
                        ],
                        rows: planDistribution.map((p: any) => ({
                            name: p.name,
                            value: p.value.toLocaleString("id-ID"),
                        })),
                    },
                    {
                        title: "Akan Kedaluwarsa (7 Hari ke Depan)",
                        columns: [
                            { header: "Member", key: "member_name" },
                            { header: "Paket", key: "plan_name" },
                            { header: "Tanggal Berakhir", key: "ends_at" },
                            { header: "Sisa Hari", key: "days_left", align: "right" as const },
                        ],
                        rows: expiringSoonList.map((m: any) => ({
                            member_name: m.member_name,
                            plan_name: m.plan_name,
                            ends_at: m.ends_at,
                            days_left: `${m.days_left} hari`,
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
            title="Laporan Membership"
            description="Status dan distribusi paket keanggotaan"
            icon={<CreditCard size={22} />}
            isLoading={isLoading}
            isError={isError}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
            filterSlot={<ReportDateFilter startDate={startDate} endDate={endDate} onFilterChange={handleFilterChange} />}
        >
            {report && (
                <div id="report-content-membership" className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CreditCard size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Membership Aktif</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{activeCount}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><PauseCircle size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Membership Dibekukan</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{frozenCount}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Kedaluwarsa di Periode Ini</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{expiredCount}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 gap-6">
                        {planDistribution.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <PieChartIcon size={18} /> Distribusi Paket Membership (Aktif)
                                </h2>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={planDistribution} 
                                                cx="50%" 
                                                cy="50%" 
                                                innerRadius={70} 
                                                outerRadius={100} 
                                                paddingAngle={5} 
                                                dataKey="value" 
                                                nameKey="name"
                                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {planDistribution.map((_: any, i: number) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val: number) => `${val} member`} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    {expiringSoonList.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Akan Kedaluwarsa (7 Hari ke Depan)</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                                            <th className="py-3 px-2">Member</th>
                                            <th className="py-3 px-2">Paket</th>
                                            <th className="py-3 px-2">Tanggal Berakhir</th>
                                            <th className="py-3 px-2 text-right">Sisa Hari</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentExpiring.map((m: any, i: number) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                                <td className="py-3 px-2 font-medium text-zinc-900">{m.member_name}</td>
                                                <td className="py-3 px-2 text-zinc-500">{m.plan_name}</td>
                                                <td className="py-3 px-2 text-zinc-500">{m.ends_at}</td>
                                                <td className="py-3 px-2 text-right">
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                                        m.days_left <= 3 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                                                    }`}>
                                                        {m.days_left} hari
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                    <span className="text-xs text-zinc-500">
                                        Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, expiringSoonList.length)} dari {expiringSoonList.length}
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setPage(p => Math.max(p - 1, 1))} 
                                            disabled={page === 1} 
                                            className="px-3 py-1.5 text-xs font-semibold text-zinc-600 bg-white border border-gray-200 rounded-md disabled:opacity-50"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-xs font-semibold text-zinc-600 px-2 py-1.5">{page}/{totalPages}</span>
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
            )}
        </ReportPageLayout>
    );
}
