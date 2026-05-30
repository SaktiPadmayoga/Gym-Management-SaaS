"use client";

import { useState, useCallback } from "react";
import { Users, UserPlus, UserMinus, BarChart3 } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";
import { useBranchReport } from "@/hooks/tenant/useBranchReport";
import ReportPageLayout from "@/components/pages/branch/report/ReportPageLayout";
import ReportDateFilter from "@/components/pages/branch/report/ReportDateFilter";
import { exportToExcel } from "@/lib/exportExcel";
import { exportToPdf, buildPdfFilename } from "@/lib/exportPdf";

const COLORS = ["#018790", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981"];
const toNumber = (v: any) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };

export default function MemberAnalyticsPage() {
    const [startDate, setStartDate] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const { data, isLoading, isError } = useBranchReport("member", startDate, endDate);
    const report = data?.data;

    const handleFilterChange = useCallback((range: { start: string; end: string }) => {
        setStartDate(range.start);
        setEndDate(range.end);
    }, []);

    const summary = report?.summary || {};
    const newMembers = summary.new_members ?? 0;
    const churnedMembers = summary.churned_members ?? 0;
    const netGrowth = summary.net_growth ?? 0;
    const churnRate = (newMembers + churnedMembers) > 0 ? ((churnedMembers / (newMembers + churnedMembers)) * 100).toFixed(1) : "0";

    const registrationTrend = report?.charts?.registration_trend || [];
    const statusDistribution = (report?.charts?.status_distribution || []).map((i: any) => ({ ...i, value: toNumber(i.value) }));
    const newMembersList = report?.tables?.new_members || [];

    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const [page, setPage] = useState(1);
    const perPage = 5;
    const totalPages = Math.ceil(newMembersList.length / perPage);
    const currentMembers = newMembersList.slice((page - 1) * perPage, page * perPage);

    const handleExportExcel = () => {
        if (!report) return;

        const summaryData = [{
            "Member Baru": newMembers,
            "Churn": churnedMembers,
            "Net Growth": netGrowth,
            "Churn Rate (%)": parseFloat(churnRate),
        }];

        const trendData = registrationTrend.map((t: any) => ({
            "Tanggal": t.date,
            "Pendaftar": t.total
        }));

        const statusData = statusDistribution.map((s: any) => ({
            "Status": s.name,
            "Jumlah": s.value
        }));

        const membersData = newMembersList.map((m: any) => ({
            "Nama": m.name,
            "Email": m.email,
            "Telepon": m.phone,
            "Status": m.status,
            "Bergabung": m.created_at
        }));

        exportToExcel([
            { sheetName: "Ringkasan", data: summaryData },
            { sheetName: "Tren Pendaftaran", data: trendData },
            { sheetName: "Distribusi Status", data: statusData },
            { sheetName: "Daftar Member Baru", data: membersData },
        ], `Laporan_Analitik_Member_${startDate}_${endDate}`);
    };

    const handleExportPdf = async () => {
        if (!report) return;
        setIsExportingPdf(true);
        try {
            await exportToPdf({
                title: "Laporan Analitik Member",
                subtitle: `Periode: ${startDate} s.d ${endDate}`,
                filename: buildPdfFilename("Member", startDate, endDate),
                summary: [
                    { label: "Member Baru", value: String(newMembers) },
                    { label: "Churn", value: String(churnedMembers) },
                    { label: "Net Growth", value: netGrowth > 0 ? `+${netGrowth}` : String(netGrowth) },
                    { label: "Churn Rate", value: `${churnRate}%` },
                ],
                tables: [
                    {
                        title: "Tren Pendaftaran",
                        columns: [
                            { header: "Tanggal", key: "date" },
                            { header: "Pendaftar", key: "total", align: "right" as const },
                        ],
                        rows: registrationTrend.map((t: any) => ({
                            date: t.date,
                            total: String(t.total),
                        })),
                    },
                    {
                        title: "Distribusi Status Member",
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
                        title: "Daftar Member Baru",
                        columns: [
                            { header: "Nama", key: "name" },
                            { header: "Email", key: "email" },
                            { header: "Telepon", key: "phone" },
                            { header: "Status", key: "status" },
                            { header: "Bergabung", key: "created_at", align: "right" as const },
                        ],
                        rows: newMembersList.map((m: any) => ({
                            name: m.name,
                            email: m.email ?? "-",
                            phone: m.phone ?? "-",
                            status: m.status,
                            created_at: m.created_at,
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
            title="Analitik Member"
            description="Pertumbuhan dan churn member cabang"
            icon={<Users size={22} />}
            isLoading={isLoading}
            isError={isError}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
            filterSlot={<ReportDateFilter startDate={startDate} endDate={endDate} onFilterChange={handleFilterChange} />}
        >
            {report && (
                <div id="report-content-member-analytics" className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><UserPlus size={22} /></div>
                            <div><p className="text-sm font-medium text-zinc-500">Member Baru</p><h3 className="text-2xl font-bold text-zinc-900">{newMembers}</h3></div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg"><UserMinus size={22} /></div>
                            <div><p className="text-sm font-medium text-zinc-500">Churn</p><h3 className="text-2xl font-bold text-zinc-900">{churnedMembers}</h3></div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Users size={22} /></div>
                            <div><p className="text-sm font-medium text-zinc-500">Net Growth</p><h3 className={`text-2xl font-bold ${netGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>{netGrowth > 0 ? `+${netGrowth}` : netGrowth}</h3></div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><BarChart3 size={22} /></div>
                            <div><p className="text-sm font-medium text-zinc-500">Churn Rate</p><h3 className={`text-2xl font-bold ${parseFloat(churnRate) > 10 ? "text-red-600" : "text-zinc-900"}`}>{churnRate}%</h3></div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-500/20">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2"><BarChart3 size={18} /> Tren Pendaftaran</h2>
                            <div className="h-64">
                                {registrationTrend.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-zinc-400 text-sm">Tidak ada data di periode ini.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={registrationTrend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                                            <defs><linearGradient id="colorMemberBranch" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#018790" stopOpacity={0.3} /><stop offset="95%" stopColor="#018790" stopOpacity={0} /></linearGradient></defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#018790" }} dy={10} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#018790" }} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="total" stroke="#018790" fillOpacity={1} fill="url(#colorMemberBranch)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {statusDistribution.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Status Member</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" nameKey="name">
                                                {statusDistribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(val: number) => `${val} member`} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    {newMembersList.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Member Baru di Periode Ini</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead><tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                                        <th className="py-3 px-2">Nama</th><th className="py-3 px-2">Email</th><th className="py-3 px-2">Telepon</th><th className="py-3 px-2">Status</th><th className="py-3 px-2 text-right">Bergabung</th>
                                    </tr></thead>
                                    <tbody>
                                        {currentMembers.map((m: any, i: number) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                                <td className="py-3 px-2 font-medium text-zinc-900">{m.name}</td>
                                                <td className="py-3 px-2 text-zinc-500 text-xs">{m.email ?? "-"}</td>
                                                <td className="py-3 px-2 text-zinc-500 text-xs">{m.phone ?? "-"}</td>
                                                <td className="py-3 px-2"><span className={`text-xs font-semibold px-2 py-1 rounded ${m.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{m.status}</span></td>
                                                <td className="py-3 px-2 text-right text-zinc-500 text-xs">{m.created_at}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                    <span className="text-xs text-zinc-500">Menampilkan {(page - 1) * perPage + 1} - {Math.min(page * perPage, newMembersList.length)} dari {newMembersList.length}</span>
                                    <div className="flex gap-2">
                                        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-semibold text-zinc-600 bg-white border border-gray-200 rounded-md disabled:opacity-50">Previous</button>
                                        <span className="text-xs font-semibold text-zinc-600 px-2 py-1.5">{page}/{totalPages}</span>
                                        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages} className="px-3 py-1.5 text-xs font-semibold text-zinc-600 bg-white border border-gray-200 rounded-md disabled:opacity-50">Next</button>
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
