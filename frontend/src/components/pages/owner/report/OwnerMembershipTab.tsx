"use client";

import React from "react";
import {
  CheckCircle, AlertCircle, AlertTriangle, Snowflake
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const toNumber = (val: any): number => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

const COLORS = ["#018790", "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6"];

export default function OwnerMembershipTab({ data, isFiltered = false }: { data: any; isFiltered?: boolean }) {
  if (!data || !data.summary) {
    return (
      <div className="p-8 text-center text-zinc-500">Tidak ada data tersedia</div>
    );
  }

  const { summary, charts, tables } = data;

  const planDistribution = (charts?.plan_distribution || []).map((item: any) => ({
    ...item,
    value: toNumber(item.value),
  }));

  const expiringSoon = tables?.expiring_soon || [];
  const frozenList   = tables?.frozen_list || [];

  return (
    <div className="space-y-6 mt-6 animate-in fade-in duration-500">

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 col-span-3">
          <div className="bg-white p-5 rounded-xl border border-gray-500/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-zinc-500 font-atkin tracking-tighter">Membership Aktif</p>
                <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit">{summary.active_count ?? 0}</h3>
                <p className="text-sm text-zinc-400 mt-1 font-atkin tracking-tighter">Paket berjalan</p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20} /></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-500/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-zinc-500 font-atkin tracking-tighter">Expired (Periode)</p>
                <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit">{summary.expired_count ?? 0}</h3>
                <p className="text-sm text-zinc-400 mt-1 font-atkin tracking-tighter">Expired di periode ini</p>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-lg"><AlertCircle size={20} /></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-500/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-zinc-500 font-atkin tracking-tighter">Frozen</p>
                <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit">{summary.frozen_count ?? 0}</h3>
                <p className="text-sm text-zinc-400 mt-1 font-atkin tracking-tighter">Membership di-cuti-kan</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Snowflake size={20} /></div>
            </div>
          </div>
        </div>

        {/* CHART: Plan Distribution */}
        {planDistribution.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-500/20 col-span-2 font-figtree">
            <h2 className="text-xl font-semibold text-zinc-900 mb-1">Distribusi Plan</h2>
            <p className="text-sm text-zinc-400 mb-4">Membership plan yang aktif saat ini</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={75}
                    paddingAngle={5} dataKey="value" nameKey="name"
                  >
                    {planDistribution.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `${val} membership`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* TABLE 1: EXPIRING SOON */}
      <div className="bg-white p-6 rounded-xl border border-gray-500/20 font-figtree">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={20} className="text-red-500" />
          <h2 className="text-lg font-semibold text-zinc-900">
            Membership Akan Expired (7 Hari)
          </h2>
          <span className="ml-auto text-xs text-zinc-400">{expiringSoon.length} membership</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="py-3 px-2">Member</th>
                <th className="py-3 px-2">Paket</th>
                {!isFiltered && <th className="py-3 px-2">Cabang</th>}
                <th className="py-3 px-2">Berakhir</th>
                <th className="py-3 px-2 text-right">Sisa Waktu</th>
              </tr>
            </thead>
            <tbody>
              {expiringSoon.length === 0 ? (
                <tr>
                  <td colSpan={isFiltered ? 4 : 5} className="text-center py-6 text-zinc-500">
                    Aman! Tidak ada membership yang akan expired dalam 7 hari.
                  </td>
                </tr>
              ) : (
                expiringSoon.map((sub: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                    <td className="py-3 px-2 font-medium text-zinc-900">{sub.member_name}</td>
                    <td className="py-3 px-2">
                      <span className="text-zinc-900 text-xs font-semibold bg-gray-100 px-2 py-1 rounded">{sub.plan_name}</span>
                    </td>
                    {!isFiltered && <td className="py-3 px-2 text-zinc-600 text-xs">{sub.branch_name}</td>}
                    <td className="py-3 px-2 text-zinc-600">{sub.ends_at}</td>
                    <td className="py-3 px-2 text-right">
                      <span className={`font-bold ${sub.days_left <= 3 ? "text-red-600" : "text-orange-500"}`}>
                        {sub.days_left === 0 ? "Hari Ini" : `${sub.days_left} Hari Lagi`}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TABLE 2: FROZEN MEMBERSHIPS */}
      {frozenList.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Snowflake size={20} className="text-blue-500" />
            <h2 className="text-lg font-semibold text-zinc-900">
              Membership Frozen (Cuti)
            </h2>
            <span className="ml-auto text-xs text-zinc-400">{frozenList.length} membership</span>
          </div>
          <p className="text-xs text-zinc-400 mb-4 ml-7">
            Member yang sedang cuti — follow up untuk reaktivasi.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-2">Member</th>
                  <th className="py-3 px-2">Paket</th>
                  <th className="py-3 px-2">Frozen Sejak</th>
                  <th className="py-3 px-2 text-right">Frozen Sampai</th>
                </tr>
              </thead>
              <tbody>
                {frozenList.map((item: any, idx: number) => (
                  <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                    <td className="py-3 px-2 font-medium text-zinc-900">{item.member_name}</td>
                    <td className="py-3 px-2">
                      <span className="text-zinc-900 text-xs font-semibold bg-gray-100 px-2 py-1 rounded">{item.plan_name}</span>
                    </td>
                    <td className="py-3 px-2 text-zinc-600">{item.frozen_at}</td>
                    <td className="py-3 px-2 text-right text-zinc-600">{item.frozen_until}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
