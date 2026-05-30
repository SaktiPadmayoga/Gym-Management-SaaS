"use client";

import { useState, useCallback } from "react";
import { Dumbbell, CheckCircle2, XCircle, AlertCircle, BarChart3 } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import dayjs from "dayjs";
import { useBranchReport } from "@/hooks/tenant/useBranchReport";
import ReportPageLayout from "@/components/pages/branch/report/ReportPageLayout";
import ReportDateFilter from "@/components/pages/branch/report/ReportDateFilter";
import { exportToExcel } from "@/lib/exportExcel";
import { exportToPdf, buildPdfFilename } from "@/lib/exportPdf";

const COLORS = ["#10B981", "#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6"];
const toNumber = (v: any) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };

export default function FacilityReportPage() {
    const [startDate, setStartDate] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
    const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
    const { data, isLoading, isError } = useBranchReport("facility", startDate, endDate);
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const report = data?.data;

    const handleFilterChange = useCallback((range: { start: string; end: string }) => {
        setStartDate(range.start);
        setEndDate(range.end);
    }, []);

    const summary = report?.summary || {};
    const totalBookings = summary.total_bookings ?? 0;
    const completedBookings = summary.completed_bookings ?? 0;
    const cancelledBookings = summary.cancelled_bookings ?? 0;
    const noShowBookings = summary.no_show_bookings ?? 0;

    const popularFacilities = report?.charts?.popular_facilities || [];
    const statusDistribution = (report?.charts?.status_distribution || []).map((i: any) => ({ ...i, value: toNumber(i.value) }));

    const handleExportExcel = () => {
        if (!report) return;

        const summaryData = [{
            "Total Booking": totalBookings,
            "Selesai / Hadir": completedBookings,
            "Dibatalkan": cancelledBookings,
            "No-Show": noShowBookings,
        }];

        const popularData = popularFacilities.map((f: any) => ({
            "Fasilitas": f.name,
            "Total Booking": f.total_bookings
        }));

        const statusData = statusDistribution.map((s: any) => ({
            "Status": s.name,
            "Jumlah": s.value
        }));

        exportToExcel([
            { sheetName: "Ringkasan", data: summaryData },
            { sheetName: "Fasilitas Populer", data: popularData },
            { sheetName: "Status Pemesanan", data: statusData },
        ], `Laporan_Fasilitas_${startDate}_${endDate}`);
    };

    const handleExportPdf = async () => {
        if (!report) return;
        setIsExportingPdf(true);
        try {
            await exportToPdf({
                title: "Laporan Fasilitas",
                subtitle: `Periode: ${startDate} s.d ${endDate}`,
                filename: buildPdfFilename("Fasilitas", startDate, endDate),
                summary: [
                    { label: "Total Booking", value: totalBookings.toLocaleString("id-ID") },
                    { label: "Selesai / Hadir", value: completedBookings.toLocaleString("id-ID") },
                    { label: "Dibatalkan", value: cancelledBookings.toLocaleString("id-ID") },
                    { label: "No-Show", value: noShowBookings.toLocaleString("id-ID") },
                ],
                tables: [
                    {
                        title: "Fasilitas Paling Sering Dibooking",
                        columns: [
                            { header: "Fasilitas", key: "name" },
                            { header: "Total Booking", key: "total_bookings", align: "right" as const },
                        ],
                        rows: popularFacilities.map((f: any) => ({
                            name: f.name,
                            total_bookings: Number(f.total_bookings).toLocaleString("id-ID"),
                        })),
                    },
                    {
                        title: "Status Pemesanan",
                        columns: [
                            { header: "Status", key: "name" },
                            { header: "Jumlah", key: "value", align: "right" as const },
                        ],
                        rows: statusDistribution.map((s: any) => ({
                            name: s.name,
                            value: Number(s.value).toLocaleString("id-ID"),
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
            title="Laporan Fasilitas"
            description="Penggunaan dan pemesanan fasilitas cabang"
            icon={<Dumbbell size={22} />}
            isLoading={isLoading}
            isError={isError}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
            filterSlot={<ReportDateFilter startDate={startDate} endDate={endDate} onFilterChange={handleFilterChange} />}
        >
            {report && (
                <div id="report-content-facility" className="space-y-6">
                    {/* Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Dumbbell size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Total Booking</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{totalBookings}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Selesai / Hadir</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{completedBookings}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-red-50 text-red-600 rounded-lg"><XCircle size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">Dibatalkan</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{cancelledBookings}</h3>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><AlertCircle size={22} /></div>
                            <div>
                                <p className="text-sm font-medium text-zinc-500">No-Show</p>
                                <h3 className="text-2xl font-bold text-zinc-900">{noShowBookings}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Charts */}
                        {popularFacilities.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20 lg:col-span-2">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
                                    <BarChart3 size={18} /> Fasilitas Paling Sering Dibooking
                                </h2>
                                <div className="h-72">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={popularFacilities} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 30 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                                            <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#6B7280" }} />
                                            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#374151" }} />
                                            <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                                            <Bar dataKey="total_bookings" name="Total Booking" fill="#018790" radius={[0, 4, 4, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {statusDistribution.length > 0 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                                <h2 className="text-lg font-semibold text-zinc-900 mb-4">Status Pemesanan</h2>
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
                                            <Tooltip formatter={(val: number) => `${val} booking`} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </ReportPageLayout>
    );
}
