"use client";

import { useState, useCallback } from "react";
import { Calendar, Users, Percent, CheckCircle2, BarChart3, Presentation } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";
import { useBranchReport } from "@/hooks/tenant/useBranchReport";
import ReportPageLayout from "@/components/pages/branch/report/ReportPageLayout";
import ReportDateFilter from "@/components/pages/branch/report/ReportDateFilter";
import { exportToExcel } from "@/lib/exportExcel";

const COLORS = ["#018790", "#3B82F6", "#F59E0B", "#EF4444", "#10B981"];
const toNumber = (v: any) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };

export default function ClassReportPage() {
    const [startDate, setStartDate] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const { data, isLoading, isError } = useBranchReport("class", startDate, endDate);
    const report = data?.data;

    const handleFilterChange = useCallback((range: { start: string; end: string }) => {
        setStartDate(range.start);
        setEndDate(range.end);
    }, []);

    const summary = report?.summary || {};
    const totalClasses = summary.total_classes ?? 0;
    const totalBooked = summary.total_booked ?? 0;
    const totalAttended = summary.total_attended ?? 0;
    const attendanceRate = summary.attendance_rate ?? 0;

    const popularClasses = report?.charts?.popular_classes || [];
    const statusDistribution = (report?.charts?.status_distribution || []).map((i: any) => ({ ...i, value: toNumber(i.value) }));
    const instructorLoad = report?.tables?.instructor_load || [];

    const handleExportExcel = () => {
        if (!report) return;

        const summaryData = [{
            "Total Kelas": totalClasses,
            "Total Booking": totalBooked,
            "Total Hadir": totalAttended,
            "Kehadiran (%)": attendanceRate,
        }];

        const popularData = popularClasses.map((c: any) => ({
            "Nama Kelas": c.name,
            "Total Sesi": c.total_sessions,
            "Total Hadir": c.total_attended
        }));

        const statusData = statusDistribution.map((s: any) => ({
            "Status": s.name,
            "Jumlah": s.value
        }));

        const instructorData = instructorLoad.map((i: any) => ({
            "Instruktur": i.name,
            "Total Sesi": i.total_sessions,
            "Total Hadir": i.total_attended,
            "Rata-rata Hadir/Sesi": i.total_sessions > 0 ? (i.total_attended / i.total_sessions).toFixed(1) : 0
        }));

        exportToExcel([
            { sheetName: "Ringkasan", data: summaryData },
            { sheetName: "Kelas Populer", data: popularData },
            { sheetName: "Status Kelas", data: statusData },
            { sheetName: "Beban Instruktur", data: instructorData },
        ], `Laporan_Kelas_${startDate}_${endDate}`);
    };

    return (
        <ReportPageLayout
            title="Laporan Kelas"
            description="Kinerja kelas dan tingkat kehadiran"
            icon={<Presentation size={22} />}
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
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Total Kelas</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{totalClasses}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Users size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Total Booking</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{totalBooked}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Total Hadir</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{totalAttended}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Percent size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Kehadiran</p>
                                <h3 className={`text-2xl font-bold ${attendanceRate >= 70 ? "text-green-600" : attendanceRate >= 50 ? "text-orange-500" : "text-red-600"}`}>
                                    {attendanceRate}%
                                </h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Charts */}
                        {popularClasses.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20 lg:col-span-2">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <BarChart3 size={18} /> Kelas Paling Populer (Berdasarkan Kehadiran)
                                </h2>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={popularClasses} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 30 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                                            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#374151" }} />
                                            <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                                            <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                                            <Bar dataKey="total_attended" name="Hadir" fill="#018790" radius={[0, 4, 4, 0]} />
                                            <Bar dataKey="total_sessions" name="Sesi" fill="#93C5FD" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {statusDistribution.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Status Kelas</h2>
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
                    </div>

                    {/* Table */}
                    {instructorLoad.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                <Users size={18} /> Beban Mengajar Instruktur
                            </h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                                            <th className="py-3 px-2">Nama Instruktur</th>
                                            <th className="py-3 px-2 text-right">Total Sesi</th>
                                            <th className="py-3 px-2 text-right">Total Member Hadir</th>
                                            <th className="py-3 px-2 text-right">Rata-rata Hadir / Sesi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {instructorLoad.map((m: any, i: number) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                                <td className="py-3 px-2 font-medium text-zinc-900">{m.name}</td>
                                                <td className="py-3 px-2 text-right text-blue-600 font-medium">{m.total_sessions}</td>
                                                <td className="py-3 px-2 text-right text-green-600 font-medium">{m.total_attended}</td>
                                                <td className="py-3 px-2 text-right text-zinc-500">
                                                    {m.total_sessions > 0 ? (m.total_attended / m.total_sessions).toFixed(1) : "0"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </ReportPageLayout>
    );
}
