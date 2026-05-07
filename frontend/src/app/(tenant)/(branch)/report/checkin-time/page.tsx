"use client";

import { useState, useCallback } from "react";
import { Clock, Users, Zap, BarChart3, Activity } from "lucide-react";
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";
import { useBranchReport } from "@/hooks/tenant/useBranchReport";
import ReportPageLayout from "@/components/pages/branch/report/ReportPageLayout";
import ReportDateFilter from "@/components/pages/branch/report/ReportDateFilter";
import { exportToExcel } from "@/lib/exportExcel";

const COLORS = ["#018790", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444"];
const toNumber = (v: any) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };

export default function CheckinTimeReportPage() {
    const [startDate, setStartDate] = useState(dayjs().subtract(7, "day").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const { data, isLoading, isError } = useBranchReport("checkin-time", startDate, endDate);
    const report = data?.data;

    const handleFilterChange = useCallback((range: { start: string; end: string }) => {
        setStartDate(range.start);
        setEndDate(range.end);
    }, []);

    const summary = report?.summary || {};
    const totalCheckins = summary.total_checkins ?? 0;
    const peakHour = summary.peak_hour ?? "-";
    const peakCount = summary.peak_count ?? 0;

    const hourlyDistribution = report?.charts?.hourly_distribution || [];
    const dailyTrend = report?.charts?.daily_trend || [];
    const dayOfWeekDistribution = (report?.charts?.day_of_week_distribution || []).map((i: any) => ({ ...i, value: toNumber(i.value) }));

    const handleExportExcel = () => {
        if (!report) return;

        const summaryData = [{
            "Total Check-in": totalCheckins,
            "Jam Paling Ramai": peakHour,
            "Rata-rata di Jam Sibuk": peakCount,
        }];

        const dailyData = dailyTrend.map((d: any) => ({
            "Tanggal": d.date,
            "Total": d.total
        }));

        const dayOfWeekData = dayOfWeekDistribution.map((d: any) => ({
            "Hari": d.name,
            "Total": d.value
        }));

        const hourlyData = hourlyDistribution.map((h: any) => ({
            "Jam": h.hour,
            "Total": h.total
        }));

        exportToExcel([
            { sheetName: "Ringkasan", data: summaryData },
            { sheetName: "Tren Harian", data: dailyData },
            { sheetName: "Distribusi Hari", data: dayOfWeekData },
            { sheetName: "Heatmap Jam Sibuk", data: hourlyData },
        ], `Laporan_Waktu_Checkin_${startDate}_${endDate}`);
    };

    return (
        <ReportPageLayout
            title="Laporan Waktu Check-in"
            description="Analisis jam sibuk dan tren kedatangan member"
            icon={<Clock size={22} />}
            isLoading={isLoading}
            isError={isError}
            onExportExcel={handleExportExcel}
            filterSlot={<ReportDateFilter startDate={startDate} endDate={endDate} onFilterChange={handleFilterChange} />}
        >
            {report && (
                <div className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Total Check-in</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{totalCheckins}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Zap size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Jam Paling Ramai</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{peakHour}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg"><Activity size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Rata-rata di Jam Sibuk</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{peakCount}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 1: Daily Trend & Day of Week */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-500/20">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                <BarChart3 size={18} /> Tren Check-in Harian
                            </h2>
                            <div className="h-64">
                                {dailyTrend.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-zinc-400 text-sm">Tidak ada data di periode ini.</div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={dailyTrend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                                            <defs>
                                                <linearGradient id="colorDailyCheckin" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} dy={10} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="total" stroke="#3B82F6" fillOpacity={1} fill="url(#colorDailyCheckin)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                        {dayOfWeekDistribution.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Hari Paling Ramai</h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={dayOfWeekDistribution} 
                                                cx="50%" 
                                                cy="50%" 
                                                innerRadius={60} 
                                                outerRadius={80} 
                                                paddingAngle={5} 
                                                dataKey="value" 
                                                nameKey="name"
                                            >
                                                {dayOfWeekDistribution.map((_: any, i: number) => (
                                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val: number) => `${val} check-in`} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chart Row 2: Hourly Distribution */}
                    {hourlyDistribution.length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                <Clock size={18} /> Heatmap Jam Sibuk (Akumulasi)
                            </h2>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={hourlyDistribution} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} dy={10} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                                        <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                                        <Bar dataKey="total" fill="#018790" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </ReportPageLayout>
    );
}
