"use client";

import React, { useState } from "react";
import { UserPlus, UserMinus, Users, BarChart3, Building2 } from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#18181B", "#3B82F6", "#8B5CF6", "#EC4899", "#10B981"];

const toNumber = (val: any): number => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

export default function OwnerMemberTab({ data, isFiltered = false }: { data: any; isFiltered?: boolean }) {
  if (!data || !data.summary) return (
    <div className="p-8 text-center text-zinc-500">Tidak ada data tersedia</div>
  );

  const { summary, charts, tables } = data;

  const newMembers     = summary.new_members     ?? 0;
  const churnedMembers = summary.churned_members ?? 0;
  const netGrowth      = summary.net_growth      ?? (newMembers - churnedMembers);

  const totalMovement = newMembers + churnedMembers;
  const churnRate     = totalMovement > 0 ? ((churnedMembers / totalMovement) * 100).toFixed(1) : "0";

  const registrationTrend = charts?.registration_trend || [];
  const planDistribution = (charts?.plan_distribution || []).map((item: any) => ({
    ...item,
    value: toNumber(item.value),
  }));
  const branchDistribution = isFiltered ? [] : (charts?.branch_distribution || []).map((item: any) => ({
    ...item,
    value: toNumber(item.value),
  }));

  const newMembersList = tables?.new_members || [];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(newMembersList.length / itemsPerPage);
  const currentMembers = newMembersList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 mt-6 animate-in fade-in duration-500">

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><UserPlus size={22} /></div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Member Baru</p>
            <h3 className="text-2xl font-bold text-zinc-900">{newMembers}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg"><UserMinus size={22} /></div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Churn</p>
            <h3 className="text-2xl font-bold text-zinc-900">{churnedMembers}</h3>
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

        <div className="bg-white p-5 rounded-xl border border-gray-500/20 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><BarChart3 size={22} /></div>
          <div>
            <p className="text-sm font-medium text-zinc-500">Churn Rate</p>
            <h3 className={`text-2xl font-bold ${parseFloat(churnRate) > 10 ? "text-red-600" : "text-zinc-900"}`}>
              {churnRate}%
            </h3>
            <p className="text-xs text-zinc-400">Churn ÷ (Baru + Churn)</p>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-500/20">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <BarChart3 size={18} /> Tren Pendaftaran Member
          </h2>
          <div className="h-64">
            {registrationTrend.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                Tidak ada pendaftaran di periode ini.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationTrend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="colorMember" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#018790" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#018790" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#018790" }} dy={10} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#018790" }} />
                  <Tooltip labelStyle={{ color: "#111827", fontWeight: 600 }} />
                  <Area type="monotone" dataKey="total" stroke="#018790" fillOpacity={1} fill="url(#colorMember)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Distribusi Membership Plan</h2>
          <div className="h-64">
            {planDistribution.length === 0 ? (
              <div className="flex items-center justify-center h-full text-zinc-400 text-sm">
                Tidak ada data distribusi plan.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    paddingAngle={5} dataKey="value" nameKey="name"
                  >
                    {planDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `${val} member`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Branch Distribution Chart */}
      {branchDistribution.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
            <Building2 size={18} /> Distribusi Member per Cabang
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={branchDistribution}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value" nameKey="name"
                >
                  {branchDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-branch-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: number) => `${val} member`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* TABLE: Member Baru */}
      {newMembersList.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Member Baru di Periode Ini</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-2">Nama</th>
                  <th className="py-3 px-2">Email</th>
                  <th className="py-3 px-2">Telepon</th>
                  {!isFiltered && <th className="py-3 px-2">Cabang</th>}
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Bergabung</th>
                </tr>
              </thead>
              <tbody>
                {currentMembers.map((m: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                    <td className="py-3 px-2 font-medium text-zinc-900">{m.name}</td>
                    <td className="py-3 px-2 text-zinc-500 text-xs">{m.email ?? "-"}</td>
                    <td className="py-3 px-2 text-zinc-500 text-xs">{m.phone ?? "-"}</td>
                    {!isFiltered && (
                      <td className="py-3 px-2">
                        <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md font-medium">
                          {m.branch_name}
                        </span>
                      </td>
                    )}
                    <td className="py-3 px-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        m.status === "active" ? "bg-green-100 text-green-700" :
                        m.status === "inactive" ? "bg-gray-100 text-gray-600" :
                        "bg-orange-100 text-orange-700"
                      }`}>
                        {m.status ?? "-"}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-zinc-500 text-xs">{m.created_at ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-zinc-500 font-medium">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, newMembersList.length)} dari {newMembersList.length} data
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
