"use client";

import { useState, useCallback } from "react";
import { Users, UserCheck, Activity, Trophy } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";
import { useBranchReport } from "@/hooks/tenant/useBranchReport";
import ReportPageLayout from "@/components/pages/branch/report/ReportPageLayout";
import ReportDateFilter from "@/components/pages/branch/report/ReportDateFilter";
import { exportToExcel } from "@/lib/exportExcel";
import { exportToPdf, buildPdfFilename } from "@/lib/exportPdf";

const COLORS = ["#018790", "#3B82F6", "#F59E0B", "#10B981"];
const toNumber = (v: any) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };

export default function CheckinMemberReportPage() {
    const [startDate, setStartDate] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const { data, isLoading, isError } = useBranchReport("checkin-member", startDate, endDate);
    const report = data?.data;

    const handleFilterChange = useCallback((range: { start: string; end: string }) => {
        setStartDate(range.start);
        setEndDate(range.end);
    }, []);

    const summary = report?.summary || {};
    const totalCheckins = summary.total_checkins ?? 0;
    const uniqueMembers = summary.unique_members ?? 0;
    const avgPerMember = summary.avg_per_member ?? 0;

    const frequencyDistribution = (report?.charts?.frequency_distribution || []).map((i: any) => ({ ...i, value: toNumber(i.value) }));
    const topMembers = report?.tables?.top_members || [];

    const handleExportExcel = () => {
        if (!report) return;

        const summaryData = [{
            "Total Check-in": totalCheckins,
            "Member Unik": uniqueMembers,
            "Rata-rata per Member": avgPerMember,
        }];

        const freqData = frequencyDistribution.map((f: any) => ({
            "Frekuensi": f.name,
            "Jumlah Member": f.value
        }));

        const topMembersData = topMembers.map((m: any) => ({
            "Nama": m.name,
            "Email": m.email,
            "Total Kunjungan": m.total_checkins
        }));

        exportToExcel([
            { sheetName: "Ringkasan", data: summaryData },
            { sheetName: "Distribusi Frekuensi", data: freqData },
            { sheetName: "Top Member", data: topMembersData },
        ], `Laporan_Aktivitas_Member_${startDate}_${endDate}`);
    };

    const handleExportPdf = async () => {
        if (!report) return;
        setIsExportingPdf(true);
        try {
            await exportToPdf({
                title: "Laporan Check-in Member",
                subtitle: `Periode: ${startDate} s.d ${endDate}`,
                filename: buildPdfFilename("CheckIn_Member", startDate, endDate),
                summary: [
                    { label: "Total Check-in", value: String(totalCheckins) },
                    { label: "Member Unik", value: String(uniqueMembers) },
                    { label: "Rata-rata per Member", value: `${avgPerMember}x` },
                ],
                tables: [
                    {
                        title: "Distribusi Frekuensi Kunjungan",
                        columns: [
                            { header: "Frekuensi", key: "name" },
                            { header: "Jumlah Member", key: "value", align: "right" as const },
                        ],
                        rows: frequencyDistribution.map((f: any) => ({
                            name: f.name,
                            value: String(f.value),
                        })),
                    },
                    {
                        title: "Top 10 Member Paling Aktif",
                        columns: [
                            { header: "Nama", key: "name" },
                            { header: "Email", key: "email" },
                            { header: "Total Kunjungan", key: "total_checkins", align: "right" as const },
                        ],
                        rows: topMembers.map((m: any) => ({
                            name: m.name,
                            email: m.email ?? "-",
                            total_checkins: `${m.total_checkins}x`,
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
            title="Aktivitas Member"
            description="Analisis frekuensi kunjungan dan member teraktif"
            icon={<UserCheck size={22} />}
            isLoading={isLoading}
            isError={isError}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
            filterSlot={<ReportDateFilter startDate={startDate} endDate={endDate} onFilterChange={handleFilterChange} />}
        >
            {report && (
                <div id="report-content-checkin-member" className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Activity size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Total Check-in</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{totalCheckins}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Users size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Member Unik</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{uniqueMembers}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><UserCheck size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Rata-rata per Member</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{avgPerMember}x</h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Charts */}
                        {frequencyDistribution.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20 lg:col-span-1">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Frekuensi Kunjungan</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={frequencyDistribution} 
                                                cx="50%" 
                                                cy="50%" 
                                                innerRadius={60} 
                                                outerRadius={80} 
                                                paddingAngle={5} 
                                                dataKey="value" 
                                                nameKey="name"
                                            >
                                                {frequencyDistribution.map((_: any, i: number) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val: number) => `${val} member`} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        {topMembers.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20 lg:col-span-2">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <Trophy size={18} className="text-yellow-500" /> Top 10 Member Paling Aktif
                                </h2>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                                                <th className="py-3 px-2 w-10 text-center">#</th>
                                                <th className="py-3 px-2">Nama</th>
                                                <th className="py-3 px-2">Email</th>
                                                <th className="py-3 px-2 text-right">Total Kunjungan</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topMembers.map((m: any, i: number) => (
                                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                                    <td className="py-3 px-2 text-center text-zinc-500">{i + 1}</td>
                                                    <td className="py-3 px-2 font-medium text-zinc-900">{m.name}</td>
                                                    <td className="py-3 px-2 text-zinc-500">{m.email ?? "-"}</td>
                                                    <td className="py-3 px-2 text-right font-semibold text-blue-600">
                                                        {m.total_checkins}x
                                                    </td>
                                                </tr>
                                            ))}
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
