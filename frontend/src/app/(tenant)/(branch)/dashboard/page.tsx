"use client";

import React from "react";
import { useTenantDashboard } from "@/hooks/tenant/useTenantDashboard";
import {
  Users,
  UserPlus,
  CreditCard,
  DollarSign,
  ScanLine,
  CalendarCheck,
  Activity,
  Clock,
  Receipt,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

// Helper format Rupiah
const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

// Status badge color map
const statusColor: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-500",
  canceled: "bg-gray-100 text-gray-500",
};

export default function DashboardBranch() {
  const { data, isLoading, isError } = useTenantDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-800"></div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center text-red-500 py-10 font-medium">
        Gagal memuat data dashboard. Silakan muat ulang halaman.
      </div>
    );
  }

  const { summary, revenue_chart, recent_check_ins, recent_transactions } = data;

  const summaryCards = [
    {
      label: "Total Member",
      value: summary.total_members,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      desc: "Member aktif di branch ini",
    },
    {
      label: "Member Baru",
      value: summary.new_members_this_month,
      icon: UserPlus,
      color: "bg-emerald-50 text-emerald-600",
      desc: "Pendaftar bulan ini",
    },
    {
      label: "Membership Aktif",
      value: summary.active_memberships,
      icon: CreditCard,
      color: "bg-purple-50 text-purple-600",
      desc: "Paket membership berjalan",
    },
    {
      label: "Check-in Hari Ini",
      value: summary.check_ins_today,
      icon: ScanLine,
      color: "bg-orange-50 text-orange-600",
      desc: "Total scan masuk hari ini",
    },
    {
      label: "Revenue Bulan Ini",
      value: formatRupiah(summary.revenue_this_month),
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      desc: "Pendapatan terbayar bulan ini",
      isCurrency: true,
    },
    {
      label: "Kelas Hari Ini",
      value: summary.upcoming_classes_today,
      icon: CalendarCheck,
      color: "bg-indigo-50 text-indigo-600",
      desc: "Jadwal kelas aktif hari ini",
    },
  ];

  return (
    <div className="space-y-6 font-figtree pb-10 bg-white p-5 rounded-xl border border-gray-500/20">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Branch Dashboard</h1>
        <p className="text-sm text-zinc-500">
          Ringkasan performa dan aktivitas branch Anda.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white p-5 rounded-xl border border-gray-500/20 shadow-sm flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-zinc-500">{card.label}</p>
                  <h3
                    className={`text-2xl font-bold text-zinc-900 mt-1 leading-tight ${
                      card.isCurrency ? "font-outfit" : "font-outfit"
                    }`}
                  >
                    {card.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-4">{card.desc}</p>
            </div>
          );
        })}
      </div>

      {/* REVENUE CHART */}
      <div className="bg-white p-6 rounded-xl border border-gray-500/20 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={20} className="text-zinc-700" />
          <h2 className="text-lg font-semibold text-zinc-900">
            Pendapatan 6 Bulan Terakhir
          </h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={revenue_chart}
              margin={{ top: 5, right: 20, bottom: 5, left: 20 }}
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
                tick={{ fontSize: 12, fill: "#6B7280" }}
                dy={10}
              />
              <YAxis
                tickFormatter={(value) =>
                  value >= 1000000
                    ? `Rp ${value / 1000000}M`
                    : value >= 1000
                    ? `Rp ${value / 1000}K`
                    : `Rp ${value}`
                }
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                dx={-10}
              />
              <Tooltip
                formatter={(value: number) => [formatRupiah(value), "Pendapatan"]}
                labelStyle={{ color: "#111827", fontWeight: 600 }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#18181B"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#18181B",
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TWO COLUMNS: RECENT CHECK-INS & RECENT TRANSACTIONS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Check-ins */}
        <div className="bg-white p-6 rounded-xl border border-gray-500/20 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-zinc-600" />
            <h2 className="text-lg font-semibold text-zinc-900">
              Check-in Terbaru
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase">
                    Member
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase">
                    Branch
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase text-right">
                    Waktu
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent_check_ins.map((ci) => (
                  <tr
                    key={ci.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        {ci.member_avatar ? (
                          <img
                            src={ci.member_avatar}
                            alt={ci.member_name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-zinc-500">
                              {ci.member_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-semibold text-zinc-800">
                          {ci.member_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-zinc-600">
                      {ci.branch_name}
                    </td>
                    <td className="py-3 px-2 text-xs text-zinc-500 text-right">
                      {dayjs(ci.checked_in_at).format("DD MMM, HH:mm")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recent_check_ins.length === 0 && (
              <div className="text-center text-sm text-zinc-500 py-6">
                Belum ada check-in hari ini.
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-xl border border-gray-500/20 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Receipt size={18} className="text-zinc-600" />
            <h2 className="text-lg font-semibold text-zinc-900">
              Transaksi Terbaru
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase">
                    Member
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase">
                    Status
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase">
                    Nominal
                  </th>
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase text-right">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody>
                {recent_transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <p className="text-sm font-semibold text-zinc-800">
                        {tx.member_name}
                      </p>
                      <p className="text-xs text-zinc-500">{tx.invoice_number}</p>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider ${
                          statusColor[tx.status] || "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm font-bold text-zinc-900">
                      {formatRupiah(tx.total_amount)}
                    </td>
                    <td className="py-3 px-2 text-xs text-zinc-500 text-right">
                      {tx.paid_at
                        ? dayjs(tx.paid_at).format("DD MMM, HH:mm")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recent_transactions.length === 0 && (
              <div className="text-center text-sm text-zinc-500 py-6">
                Belum ada transaksi.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
