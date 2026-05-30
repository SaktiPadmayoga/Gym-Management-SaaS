"use client";

import React from "react";
import { useCentralDashboard } from "@/hooks/useCentralDashboard";
import { 
  Building2, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Activity,
  CreditCard
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
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

export default function CentralDashboardPage() {
  const { data, isLoading, isError } = useCentralDashboard();

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

  const { summary, revenue_chart, recent_tenants, recent_payments } = data;

  return (
    <div className="space-y-6 font-figtree pb-10 bg-white p-5 rounded-xl border border-gray-500/20 ">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Platform Overview</h1>
        <p className="text-sm text-zinc-500">Pantau performa dan metrik utama SaaS GYMFIT.</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-zinc-500">Proyeksi MRR</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit leading-tight">{formatRupiah(summary.mrr)}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp size={20} /></div>
          </div>
          <p className="text-xs text-zinc-400 mt-4">Estimasi pendapatan berulang bulanan</p>
        </div>

        {/* Revenue This Month */}
        <div className="bg-white p-5 rounded-xl border border-gray-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-zinc-500">Revenue Bulan Ini</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit leading-tight">{formatRupiah(summary.revenue_this_month)}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
          </div>
          <p className="text-xs text-zinc-400 mt-4">Total pembayaran sukses bulan ini</p>
        </div>

        {/* Active Tenants */}
        <div className="bg-white p-5 rounded-xl border border-gray-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-zinc-500">Gym Aktif</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit leading-tight">{summary.active_tenants}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Building2 size={20} /></div>
          </div>
          <p className="text-xs text-zinc-400 mt-4">Termasuk tenant trial & berbayar</p>
        </div>

        {/* New Tenants */}
        <div className="bg-white p-5 rounded-xl border border-gray-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-zinc-500">Gym Baru</p>
              <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit leading-tight">{summary.new_tenants_this_month}</h3>
            </div>
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><Users size={20} /></div>
          </div>
          <p className="text-xs text-zinc-400 mt-4">Gym yang mendaftar bulan ini</p>
        </div>
      </div>

      {/* REVENUE CHART */}
      <div className="bg-white p-6 rounded-xl border border-gray-500/20 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={20} className="text-zinc-700" />
          <h2 className="text-lg font-semibold text-zinc-900">Pertumbuhan Pendapatan (6 Bulan Terakhir)</h2>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenue_chart} margin={{ top: 5, right: 20, bottom: 5, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
              <YAxis 
                tickFormatter={(value) => `Rp ${value / 1000000}M`} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 12, fill: '#6B7280' }} 
                dx={-10}
              />
              <Tooltip 
                formatter={(value: number) => [formatRupiah(value), "Pendapatan"]}
                labelStyle={{ color: '#111827', fontWeight: 600 }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#18181B" strokeWidth={3} dot={{ r: 4, fill: "#18181B", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TWO COLUMNS: RECENT TENANTS & RECENT PAYMENTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Recent Tenants */}
        <div className="bg-white p-6 rounded-xl border border-gray-500/20 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Pendaftar Gym Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase">Nama Gym</th>
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase">Owner</th>
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase">Status</th>
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase text-right">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recent_tenants.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-2">
                      <p className="text-sm font-semibold text-zinc-800">{tenant.name}</p>
                      <p className="text-xs text-zinc-500">{tenant.slug}.gymfit.id</p>
                    </td>
                    <td className="py-3 px-2 text-sm text-zinc-700">{tenant.owner_name}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md tracking-wider
                        ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 
                          tenant.status === 'trial' ? 'bg-blue-100 text-blue-700' : 
                          'bg-gray-100 text-gray-700'}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-xs text-zinc-500 text-right">
                      {dayjs(tenant.created_at).format('DD MMM YYYY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recent_tenants.length === 0 && (
              <div className="text-center text-sm text-zinc-500 py-6">Belum ada tenant baru.</div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white p-6 rounded-xl border border-gray-500/20 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Pembayaran Terbaru</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase">Gym</th>
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase">Metode</th>
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase">Nominal</th>
                  <th className="py-3 px-2 text-xs font-semibold text-zinc-500 uppercase text-right">Waktu Lunas</th>
                </tr>
              </thead>
              <tbody>
                {recent_payments.map((payment) => (
                  <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-2">
                      <p className="text-sm font-semibold text-zinc-800">{payment.tenant_name}</p>
                      <p className="text-xs text-zinc-500">{payment.order_id}</p>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-600 bg-gray-100 w-max px-2 py-1 rounded-md">
                        <CreditCard size={12} />
                        <span className="uppercase">{payment.payment_type || 'MIDTRANS'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm font-bold text-zinc-900">
                      {formatRupiah(payment.gross_amount)}
                    </td>
                    <td className="py-3 px-2 text-xs text-zinc-500 text-right">
                      {dayjs(payment.paid_at).format('DD MMM, HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {recent_payments.length === 0 && (
              <div className="text-center text-sm text-zinc-500 py-6">Belum ada transaksi sukses.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}