 "use client";

import { useState } from "react";
import { CalendarDays, DollarSign, Users, Clock, Dumbbell, CreditCard } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";
import { useBranchReport } from "@/hooks/tenant/useBranchReport";
import ReportPageLayout from "@/components/pages/branch/report/ReportPageLayout";
import ReportDateFilter from "@/components/pages/branch/report/ReportDateFilter";
import { exportToExcel } from "@/lib/exportExcel";
import { exportToPdf, buildPdfFilename } from "@/lib/exportPdf";

const formatRupiah = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
const toNumber = (v: any) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };

export default function DailyReportPage() {
    const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [isExportingPdf, setIsExportingPdf] = useState(false);
    const { data, isLoading, isError } = useBranchReport("daily", undefined, undefined, date);
    const report = data?.data;

    const handleExportExcel = () => {
        if (!report) return;

        const summaryData = [{
            "Pendapatan": report.summary?.revenue || 0,
            "Transaksi": report.summary?.transactions || 0,
            "Check-in": report.summary?.check_ins || 0,
            "Member Baru": report.summary?.new_members || 0,
            "Kelas": report.summary?.classes || 0,
            "Peserta Kelas": report.summary?.class_attendees || 0,
            "PT Sessions": report.summary?.pt_sessions || 0,
        }];

        const hourlyData = (report.charts?.hourly_checkins || []).map((h: any) => ({
            "Jam": h.hour,
            "Total": h.total
        }));

        const txData = (report.tables?.recent_transactions || []).map((tx: any) => ({
            "Invoice": tx.invoice_number,
            "Member": tx.member_name,
            "Metode": tx.payment_method || "OTHER",
            "Total": tx.total_amount,
            "Waktu": tx.paid_at ? dayjs(tx.paid_at).format("HH:mm:ss") : "-"
        }));

        exportToExcel([
            { sheetName: "Ringkasan", data: summaryData },
            { sheetName: "Check-in Per Jam", data: hourlyData },
            { sheetName: "Transaksi", data: txData }
        ], `Laporan_Harian_${date}`);
    };

    const handleExportPdf = async () => {
        if (!report) return;
        setIsExportingPdf(true);
        try {
            const s = report.summary || {};
            await exportToPdf({
                title: "Laporan Harian",
                subtitle: `Tanggal: ${dayjs(date).format("DD MMMM YYYY")}`,
                filename: buildPdfFilename("Harian", date, date),
                summary: [
                    { label: "Pendapatan", value: formatRupiah(toNumber(s.revenue)) },
                    { label: "Transaksi", value: s.transactions ?? 0 },
                    { label: "Check-in", value: s.check_ins ?? 0 },
                    { label: "Member Baru", value: s.new_members ?? 0 },
                    { label: "Kelas", value: s.classes ?? 0 },
                    { label: "Peserta Kelas", value: s.class_attendees ?? 0 },
                    { label: "PT Sessions", value: s.pt_sessions ?? 0 },
                ],
                tables: [
                    {
                        title: "Distribusi Check-in per Jam",
                        columns: [
                            { header: "Jam", key: "hour" },
                            { header: "Total", key: "total", align: "right" },
                        ],
                        rows: (report.charts?.hourly_checkins || []).map((h: any) => ({ hour: h.hour, total: h.total })),
                    },
                    {
                        title: "Transaksi Hari Ini",
                        columns: [
                            { header: "Invoice", key: "invoice" },
                            { header: "Member", key: "member" },
                            { header: "Metode", key: "metode" },
                            { header: "Total", key: "total", align: "right" },
                        ],
                        rows: (report.tables?.recent_transactions || []).map((tx: any) => ({
                            invoice: tx.invoice_number,
                            member: tx.member_name,
                            metode: tx.payment_method || "OTHER",
                            total: formatRupiah(toNumber(tx.total_amount)),
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
            title="Laporan Harian"
            description={`Snapshot aktivitas cabang — ${dayjs(date).format("DD MMMM YYYY")}`}
            icon={<CalendarDays size={22} />}
            isLoading={isLoading}
            isError={isError}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            isExportingPdf={isExportingPdf}
            filterSlot={
                <ReportDateFilter startDate="" endDate="" onFilterChange={() => {}} showDatePicker date={date} onDateChange={setDate} />
            }
        >
            {report && (
                <div id="report-content-daily" className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <SummaryCard icon={<DollarSign size={20} />} label="Pendapatan" value={formatRupiah(toNumber(report.summary?.revenue))} color="green" />
                        <SummaryCard icon={<CreditCard size={20} />} label="Transaksi" value={report.summary?.transactions ?? 0} color="blue" />
                        <SummaryCard icon={<Clock size={20} />} label="Check-in" value={report.summary?.check_ins ?? 0} color="violet" />
                        <SummaryCard icon={<Users size={20} />} label="Member Baru" value={report.summary?.new_members ?? 0} color="teal" />
                        <SummaryCard icon={<CalendarDays size={20} />} label="Kelas" value={report.summary?.classes ?? 0} color="amber" />
                        <SummaryCard icon={<Users size={20} />} label="Peserta Kelas" value={report.summary?.class_attendees ?? 0} color="pink" />
                        <SummaryCard icon={<Dumbbell size={20} />} label="PT Sessions" value={report.summary?.pt_sessions ?? 0} color="indigo" />
                    </div>

                    {/* Hourly Check-in Chart */}
                    {(report.charts?.hourly_checkins || []).length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Distribusi Check-in per Jam</h2>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={report.charts.hourly_checkins}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Bar dataKey="total" fill="#018790" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Recent Transactions */}
                    {(report.tables?.recent_transactions || []).length > 0 && (
                        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
                            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Transaksi Hari Ini</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                                            <th className="py-3 px-2">Invoice</th>
                                            <th className="py-3 px-2">Member</th>
                                            <th className="py-3 px-2">Metode</th>
                                            <th className="py-3 px-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.tables.recent_transactions.map((tx: any, i: number) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                                                <td className="py-3 px-2 font-mono text-xs text-zinc-600">{tx.invoice_number}</td>
                                                <td className="py-3 px-2 font-medium text-zinc-900">{tx.member_name}</td>
                                                <td className="py-3 px-2"><span className="uppercase text-xs bg-gray-100 px-2 py-1 rounded">{tx.payment_method || "OTHER"}</span></td>
                                                <td className="py-3 px-2 text-right font-bold text-zinc-900">{formatRupiah(toNumber(tx.total_amount))}</td>
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

function SummaryCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: any; color: string }) {
    const colorMap: Record<string, string> = {
        green: "bg-green-50 text-green-600", blue: "bg-blue-50 text-blue-600", violet: "bg-violet-50 text-violet-600",
        teal: "bg-teal-50 text-teal-600", amber: "bg-amber-50 text-amber-600", pink: "bg-pink-50 text-pink-600",
        indigo: "bg-indigo-50 text-indigo-600", red: "bg-red-50 text-red-600", orange: "bg-orange-50 text-orange-600",
    };
    return (
        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${colorMap[color] || colorMap.blue}`}>{icon}</div>
            <div>
                <p className="text-sm font-medium text-zinc-500">{label}</p>
                <h3 className="text-2xl font-bold text-zinc-900">{value}</h3>
            </div>
        </div>
    );
}
