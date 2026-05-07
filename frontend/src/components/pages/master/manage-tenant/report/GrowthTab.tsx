import React, { useState } from "react";
import { Users, UserPlus, UserMinus, BarChart3, TrendingDown, Percent } from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#18181B", "#3B82F6", "#8B5CF6", "#EC4899"];

const toNumber = (val: any): number => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

export default function GrowthTab({ data }: { data: any }) {
  if (!data || !data.summary) return (
    <div className="p-8 text-center text-zinc-500">Tidak ada data tersedia</div>
  );

  const { summary, charts, tables } = data;

  const newTenants     = summary.new_tenants     ?? 0;
  const churnedTenants = summary.churned_tenants ?? 0;
  const netGrowth      = summary.net_growth      ?? (newTenants - churnedTenants);

  // Churn Rate: churned / (new + churned) * 100 — derived, nol query baru
  const totalMovement = newTenants + churnedTenants;
  const churnRate     = totalMovement > 0 ? ((churnedTenants / totalMovement) * 100).toFixed(1) : "0";

  // Trial-to-Paid Conversion Rate — dari backend jika ada
  const conversionRate = summary.trial_to_paid_rate != null
    ? `${toNumber(summary.trial_to_paid_rate).toFixed(1)}%`
    : null;

  // Guard untuk chart data
  const acquisitionTrend = charts?.acquisition_trend || [];
  const planDistribution = (charts?.plan_distribution || []).map((item: any) => ({
    ...item,
    value: toNumber(item.value), // pastikan number
  }));

  // Tabel tenant baru — dari backend jika ada
  const newTenantsList = tables?.new_tenants || [];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(newTenantsList.length / itemsPerPage);
  const currentTenants = newTenantsList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 mt-6 animate-in fade-in duration-500">

      {/* SUMMARY CARDS — 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><UserPlus size={22} /></div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Tenant Baru</p>
            <h3 className="text-2xl font-bold text-zinc-900">{newTenants}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><UserMinus size={22} /></div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Churn</p>
            <h3 className="text-2xl font-bold text-zinc-900">{churnedTenants}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Users size={22} /></div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Net Growth</p>
            <h3 className={`text-2xl font-bold ${netGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {netGrowth > 0 ? `+${netGrowth}` : netGrowth}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><TrendingDown size={22} /></div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Churn Rate</p>
            <h3 className={`text-2xl font-bold ${parseFloat(churnRate) > 10 ? "text-red-600" : "text-zinc-900"}`}>
              {churnRate}%
            </h3>
            <p className="text-xs text-zinc-400">Churn ÷ (Baru + Churn)</p>
          </div>
        </div>

      {/* Conversion Rate card — conditional, hanya jika backend kirim */}
      {conversionRate && (
        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg"><Percent size={22} /></div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Trial → Paid Conversion</p>
            <h3 className="text-2xl font-bold text-zinc-900">{conversionRate}</h3>
            <p className="text-xs text-zinc-400">Persentase trial yang convert ke berbayar</p>
          </div>
        </div>
      )}
      </div>

      

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-500/20">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <BarChart3 size={18} /> Tren Pendaftaran (Acquisition)
          </h2>
          <div className="h-64">
            {acquisitionTrend.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                Tidak ada data pendaftaran di periode ini.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={acquisitionTrend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#018790" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#018790" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#018790" }} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#018790" }} />
                  <Tooltip labelStyle={{ color: "#111827", fontWeight: 600 }} />
                  <Area type="monotone" dataKey="total" stroke="#018790" fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Distribusi Paket (Plan)</h2>
          <div className="h-64">
            {planDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                Tidak ada data distribusi paket.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {planDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `${val} tenant`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* TABLE: Tenant Baru — conditional, hanya jika backend kirim */}
      {newTenantsList.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Tenant Baru di Periode Ini</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-2">Nama Gym</th>
                  <th className="py-3 px-2">Owner</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Bergabung</th>
                </tr>
              </thead>
              <tbody>
                {/* 2. Gunakan currentTenants hasil slice, bukan newTenantsList langsung */}
                {currentTenants.map((t: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                    <td className="py-3 px-2 font-medium text-zinc-900">{t.name}</td>
                    <td className="py-3 px-2 text-zinc-600">{t.owner_name ?? "-"}</td>
                    <td className="py-3 px-2 text-zinc-500 text-xs">{t.owner_email ?? "-"}</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        t.status === "active" ? "bg-green-100 text-green-700" :
                        t.status === "trial"  ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {t.status ?? "-"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-zinc-500 text-xs">{t.created_at ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 3. Simple Pagination UI */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-zinc-500 font-medium">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, newTenantsList.length)} dari {newTenantsList.length} data
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-600 bg-white border border-gray-200 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs font-semibold text-zinc-600 px-2">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-600 bg-white border border-gray-200 rounded-md hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}