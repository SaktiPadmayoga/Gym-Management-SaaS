import React, { useState, useMemo } from "react";
import {
  TrendingUp, CheckCircle, AlertTriangle, AlertCircle, BarChart2
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const formatRupiah = (angka: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

const toNumber = (val: any): number => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

const COLORS = ["#018790", "#3B82F6", "#F59E0B", "#10B981"];

export default function SubscriptionTab({ data }: { data: any }) {
  const [filterStatus, setFilterStatus] = useState<"all" | "expiring" | "safe">("all");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const { summary, tables, charts } = data;
  const mrr = toNumber(summary.current_mrr);
  const arr = mrr * 12;

  if (!data || !data.summary) {
    return (
      <div className="p-8 text-center text-zinc-500">Tidak ada data tersedia</div>
    );
  }

  const billingCycleData: { name: string; value: number }[] = charts?.billing_cycle || [];

  const planOptions: string[] = useMemo(() => {
    const allActive = (tables?.expiring_soon || []).map((s: any) => s.plan_name);
    const allTrial = (tables?.trial_expiring_soon || []).map((s: any) => s.plan_name);
    return ["all", ...Array.from(new Set<string>([...allActive, ...allTrial]))];
  }, [tables]);

  const filteredExpiring = useMemo(() => {
    return (tables?.expiring_soon || []).filter((sub: any) => {
      const matchPlan = filterPlan === "all" || sub.plan_name === filterPlan;
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "expiring" && sub.days_left <= 3) ||
        (filterStatus === "safe" && sub.days_left > 3);
      return matchPlan && matchStatus;
    });
  }, [tables, filterStatus, filterPlan]);

  const filteredTrialExpiring = useMemo(() => {
    return (tables?.trial_expiring_soon || []).filter((sub: any) => {
      return filterPlan === "all" || sub.plan_name === filterPlan;
    });
  }, [tables, filterPlan]);

  return (
    <div className="space-y-4 mt-6 animate-in fade-in duration-500">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-3">
          <div className="bg-white p-5 rounded-xl border border-gray-500/20">
            <div className="flex justify-between items-start">
              <div>
                <p className=" font-medium text-zinc-500 font-atkin tracking-tighter">MRR</p>
                <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit">{formatRupiah(mrr)}</h3>
                <p className="text-sm text-zinc-400 mt-1 font-atkin tracking-tighter">Pendapatan Bulanan</p>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><TrendingUp size={20} /></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-500/20">
            <div className="flex justify-between items-start">
              <div>
                <p className=" font-medium text-zinc-500 font-atkin tracking-tighter">ARR</p>
                <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit">{formatRupiah(arr)}</h3>
                <p className="text-sm text-zinc-400 mt-1 font-atkin tracking-tighter">MRR × 12</p>
              </div>
              <div className="p-3 bg-violet-50 text-violet-600 rounded-lg"><BarChart2 size={20} /></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-500/20">
            <div className="flex justify-between items-start">
              <div>
                <p className=" font-medium text-zinc-500 font-atkin tracking-tighter">Langganan Aktif</p>
                <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit">{summary.active_count ?? 0} Gym</h3>
                <p className="text-sm text-zinc-400 mt-1 font-atkin tracking-tighter">Status berbayar</p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={20} /></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-500/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text font-medium text-zinc-500 font-atkin tracking-tighter">Langganan Trial</p>
                <h3 className="text-2xl font-bold text-zinc-900 mt-1 font-outfit">{summary.trial_count ?? 0} Gym</h3>
                <p className="text-sm text-zinc-400 mt-1 font-atkin tracking-tighter">Belum berbayar</p>
              </div>
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><AlertTriangle size={20} /></div>
            </div>
          </div>
          
        </div>
        {/* CHART: Billing Cycle — conditional, hanya tampil jika ada data dari backend */}
        {billingCycleData.length > 0 && (
          <div className="bg-white p-6 rounded-xl border border-gray-500/20 col-span-2 font-figtree">
            <h2 className="text-xl font-semibold text-zinc-900 mb-1">Distribusi Billing Cycle</h2>
            <p className="text-sm text-zinc-400 mb-4">Monthly vs Yearly dari seluruh langganan aktif</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={billingCycleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                  >
                    {billingCycleData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `${val} tenant`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* FILTER BAR */}
      {/* <div className="flex flex-col md:flex-row md:items-center gap-3">
        <span className="text-sm text-zinc-500 shrink-0">Filter Tabel:</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Urgensi</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-aksen-secondary text-zinc-600"
          >
            <option value="all">Semua</option>
            <option value="expiring">Kritis (≤ 3 hari)</option>
            <option value="safe">Aman (&gt; 3 hari)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Paket</span>
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-aksen-secondary text-zinc-600"
          >
            {planOptions.map((plan) => (
              <option key={plan} value={plan}>
                {plan === "all" ? "Semua Paket" : plan}
              </option>
            ))}
          </select>
        </div>
        {(filterStatus !== "all" || filterPlan !== "all") && (
          <button
            onClick={() => { setFilterStatus("all"); setFilterPlan("all"); }}
            className="text-xs text-aksen-secondary underline ml-auto cursor-pointer"
          >
            Reset Filter
          </button>
        )}
      </div> */}

      {/* TABLE 1: ACTIVE EXPIRING SOON */}
      <div className="bg-white p-6 rounded-xl border border-gray-500/20 font-figtree">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={20} className="text-red-500" />
          <h2 className="text-lg font-semibold text-zinc-900">
            Risiko Churn: Aktif — Expired dalam 7 Hari
          </h2>
          <span className="ml-auto text-xs text-zinc-400">{filteredExpiring.length} tenant</span>
        </div>
        <ExpiringTable
          rows={filteredExpiring}
          emptyMessage="Aman! Tidak ada tenant aktif yang akan expired dalam 7 hari."
        />
      </div>

      {/* TABLE 2: TRIAL EXPIRING SOON — tampil hanya jika backend sudah kirim key ini */}
      {tables?.trial_expiring_soon !== undefined && (
        <div className="bg-white p-6 rounded-xl border border-gray-500/20">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={20} className="text-orange-500" />
            <h2 className="text-lg font-semibold text-zinc-900">
              Potensi Konversi: Trial — Expired dalam 7 Hari
            </h2>
            <span className="ml-auto text-xs text-zinc-400">{filteredTrialExpiring.length} tenant</span>
          </div>
          <p className="text-xs text-zinc-400 mb-4 ml-7">
            Tenant trial yang akan habis — follow up untuk konversi ke berbayar.
          </p>
          <ExpiringTable
            rows={filteredTrialExpiring}
            emptyMessage="Tidak ada tenant trial yang akan expired dalam 7 hari."
          />
        </div>
      )}
    </div>
  );
}

// ─── Reusable tabel expiring ──────────────────────────────────────────────────
function ExpiringTable({ rows, emptyMessage }: { rows: any[]; emptyMessage: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 text-xs text-zinc-500 uppercase tracking-wider">
            <th className="py-3 px-2">Nama Gym</th>
            <th className="py-3 px-2">Paket Langganan</th>
            <th className="py-3 px-2">Tanggal Jatuh Tempo</th>
            <th className="py-3 px-2 text-right">Sisa Waktu</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-6 text-zinc-500">{emptyMessage}</td>
            </tr>
          ) : (
            rows.map((sub: any, idx: number) => (
              <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 text-sm">
                <td className="py-3 px-2 font-medium text-zinc-900">{sub.tenant_name}</td>
                <td className="py-3 px-2">
                  <span className="text-zinc-900 text-xs font-semibold bg-gray-100 px-2 py-1 rounded">{sub.plan_name}</span>
                </td>
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
  );
}