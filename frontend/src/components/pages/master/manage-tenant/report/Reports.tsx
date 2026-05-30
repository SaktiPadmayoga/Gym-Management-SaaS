"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DollarSign, LineChart, RefreshCw, Download, Loader2 } from "lucide-react";
import { useCentralReports } from "@/hooks/useCentralReport";

// Import Tab Components
import FinanceTab from "@/components/pages/master/manage-tenant/report/FinanceTab";
import GrowthTab from "@/components/pages/master/manage-tenant/report/GrowthTab";
import SubscriptionTab from "@/components/pages/master/manage-tenant/report/SubscriptionTab";

// FIX: Tambah useCallback
import { useState, useCallback } from "react";
import dayjs from "dayjs";
import apiClient from "@/lib/api-client";
import { exportToExcel } from "@/lib/exportExcel";

// Default range: 7 hari terakhir — dihitung sekali saat module load, bukan tiap render
const DEFAULT_START = dayjs().subtract(7, "day").format("YYYY-MM-DD");
const DEFAULT_END = dayjs().format("YYYY-MM-DD");

export default function Reports() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);

  // FIX: Inisialisasi langsung dengan nilai default 7 hari agar API call pertama sudah ada parameternya
  const [startDate, setStartDate] = useState<string>(DEFAULT_START);
  const [endDate, setEndDate] = useState<string>(DEFAULT_END);

  const currentTab = searchParams.get("tab") || "finance";

  const { data, isLoading, isError } = useCentralReports(currentTab, startDate, endDate);

  const tabs = [
    { id: "finance", label: "Laporan Keuangan", icon: <DollarSign size={18} /> },
    { id: "growth", label: "Pertumbuhan & Churn", icon: <LineChart size={18} /> },
    { id: "subscription", label: "Aktivitas Langganan", icon: <RefreshCw size={18} /> },
  ];

  const handleExport = () => {
    if (!data?.data) return;
    const { summary, charts, tables } = data.data;

    try {
      setIsExporting(true);

      if (currentTab === "finance") {
        const summaryData = [{
          "Total Pendapatan": summary?.total_revenue || 0,
          "Total Transaksi": summary?.total_transactions || 0,
        }];
        const trendData = (charts?.revenue_trend || []).map((t: any) => ({
          "Tanggal": t.date,
          "Pendapatan": t.revenue
        }));
        const methodData = (charts?.revenue_by_method || []).map((m: any) => ({
          "Metode": m.name,
          "Pendapatan": m.value
        }));
        const tenantData = (charts?.top_tenants || []).map((t: any) => ({
          "Tenant": t.name,
          "Pendapatan": t.revenue
        }));
        const txData = (tables?.recent_transactions || []).map((tx: any) => ({
          "Order ID": tx.order_id,
          "Tenant": tx.tenant_name,
          "Metode": tx.payment_type || "MIDTRANS",
          "Waktu Bayar": tx.paid_at ? dayjs(tx.paid_at).format("YYYY-MM-DD HH:mm:ss") : "-",
          "Total": tx.gross_amount
        }));
        exportToExcel([
          { sheetName: "Ringkasan", data: summaryData },
          { sheetName: "Tren Pendapatan", data: trendData },
          { sheetName: "Metode Pembayaran", data: methodData },
          { sheetName: "Top Tenants", data: tenantData },
          { sheetName: "Transaksi", data: txData },
        ], `Admin_Finance_Report_${startDate}_${endDate}`);
      } else if (currentTab === "growth") {
        const summaryData = [{
          "Tenant Baru": summary?.new_tenants || 0,
          "Churn": summary?.churned_tenants || 0,
          "Net Growth": summary?.net_growth || 0,
          "Trial to Paid Rate (%)": summary?.trial_to_paid_rate || 0
        }];
        const trendData = (charts?.acquisition_trend || []).map((t: any) => ({
          "Tanggal": t.date,
          "Total": t.total
        }));
        const planData = (charts?.plan_distribution || []).map((p: any) => ({
          "Paket": p.name,
          "Jumlah": p.value
        }));
        const newTenantsData = (tables?.new_tenants || []).map((t: any) => ({
          "Nama Gym": t.name,
          "Owner": t.owner_name || "-",
          "Email": t.owner_email || "-",
          "Status": t.status || "-",
          "Bergabung": t.created_at || "-"
        }));
        exportToExcel([
          { sheetName: "Ringkasan", data: summaryData },
          { sheetName: "Tren Pendaftaran", data: trendData },
          { sheetName: "Distribusi Paket", data: planData },
          { sheetName: "Tenant Baru", data: newTenantsData },
        ], `Admin_Growth_Report_${startDate}_${endDate}`);
      } else if (currentTab === "subscription") {
        const summaryData = [{
          "MRR": summary?.current_mrr || 0,
          "Langganan Aktif": summary?.active_count || 0,
          "Langganan Trial": summary?.trial_count || 0
        }];
        const cycleData = (charts?.billing_cycle || []).map((c: any) => ({
          "Siklus": c.name,
          "Jumlah": c.value
        }));
        const expiringData = (tables?.expiring_soon || []).map((s: any) => ({
          "Nama Gym": s.tenant_name,
          "Paket": s.plan_name,
          "Jatuh Tempo": s.ends_at,
          "Sisa Hari": s.days_left
        }));
        const trialExpiringData = (tables?.trial_expiring_soon || []).map((s: any) => ({
          "Nama Gym": s.tenant_name,
          "Paket": s.plan_name,
          "Jatuh Tempo": s.ends_at,
          "Sisa Hari": s.days_left
        }));
        exportToExcel([
          { sheetName: "Ringkasan", data: summaryData },
          { sheetName: "Billing Cycle", data: cycleData },
          { sheetName: "Akan Kedaluwarsa", data: expiringData },
          { sheetName: "Trial Akan Kedaluwarsa", data: trialExpiringData },
        ], `Admin_Subscription_Report_${startDate}_${endDate}`);
      }
    } catch (error) {
      console.error("Gagal export laporan:", error);
      alert("Terjadi kesalahan saat mengekspor laporan.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // FIX: Gunakan useCallback agar referensi stabil — tidak dibuat ulang tiap render.
  // Tanpa ini, FinanceTab akan re-fire useEffect setiap render karena onFilterChange
  // dianggap "berubah" padahal isinya sama.
  const handleFilterChange = useCallback((range: { start: string; end: string }) => {
    setStartDate(range.start);
    setEndDate(range.end);
  }, []); // deps kosong = referensi tidak pernah berubah

  return (
    <div className="space-y-6 pb-10 bg-white p-5 rounded-xl border border-gray-500/20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Analitik Platform</h1>
          <p className="text-sm text-zinc-500">Laporan mendalam mengenai performa SaaS GYMFIT.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 bg-aksen-secondary text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          {isExporting ? "Mengekspor..." : "Export Laporan"}
        </button>
      </div>

      {/* TABS NAVIGATION */}
      <div className="border-b border-aksen-secondary">
        <nav className="flex gap-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative whitespace-nowrap ${
                  isActive
                    ? "text-aksen-secondary"
                    : "text-zinc-500 hover:text-aksen-secondary"
                }`}
              >
                {tab.icon}
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-aksen-secondary rounded-t-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB CONTENT WITH LOADING STATE */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Mengambil data laporan...</p>
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center h-64 text-red-500 font-medium bg-red-50 rounded-xl">
            Gagal memuat laporan. Coba refresh halaman.
          </div>
        ) : (
          <>
            {currentTab === "finance" && (
              <FinanceTab
                data={data?.data}
                startDate={startDate}
                endDate={endDate}
                onFilterChange={handleFilterChange}
              />
            )}
            {currentTab === "growth" && <GrowthTab data={data?.data} />}
            {currentTab === "subscription" && <SubscriptionTab data={data?.data} />}
          </>
        )}
      </div>
    </div>
  );
}