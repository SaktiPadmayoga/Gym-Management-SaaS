"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DollarSign, Users, CreditCard, Download, Loader2, Building2, ChevronDown } from "lucide-react";
import { useOwnerReports } from "@/hooks/tenant/useOwnerReports";
import { useOwnerBranches } from "@/hooks/tenant/useOwnerBranches";

import OwnerFinanceTab from "@/components/pages/owner/report/OwnerFinanceTab";
import OwnerMemberTab from "@/components/pages/owner/report/OwnerMemberTab";
import OwnerMembershipTab from "@/components/pages/owner/report/OwnerMembershipTab";

import { useState, useCallback, useRef, useEffect } from "react";
import dayjs from "dayjs";
import tenantApiClient from "@/lib/tenant-api-client";
import { exportToExcel } from "@/lib/exportExcel";

const DEFAULT_START = dayjs().subtract(7, "day").format("YYYY-MM-DD");
const DEFAULT_END = dayjs().format("YYYY-MM-DD");

export default function OwnerReports() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);

  const [startDate, setStartDate] = useState<string>(DEFAULT_START);
  const [endDate, setEndDate] = useState<string>(DEFAULT_END);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentTab = searchParams.get("tab") || "finance";

  // Fetch branch list
  const { data: branches, isLoading: isBranchesLoading } = useOwnerBranches();

  // Fetch report data with branch filter
  const { data, isLoading, isError } = useOwnerReports(currentTab, startDate, endDate, selectedBranch);

  const selectedBranchName = selectedBranch === "all"
    ? "Semua Cabang"
    : branches?.find((b) => b.id === selectedBranch)?.name ?? "Cabang";

  const tabs = [
    { id: "finance", label: "Laporan Keuangan", icon: <DollarSign size={18} /> },
    { id: "member", label: "Pertumbuhan Member", icon: <Users size={18} /> },
    { id: "membership", label: "Aktivitas Membership", icon: <CreditCard size={18} /> },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    setIsBranchDropdownOpen(false);
  };

  const handleExport = () => {
    if (!data?.data) return;
    const { summary, charts, tables } = data.data;

    try {
      setIsExporting(true);
      const branchSuffix = selectedBranch !== "all" ? `_${selectedBranchName}` : "";

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
        const branchData = (charts?.top_branches || []).map((t: any) => ({
          "Cabang": t.name,
          "Pendapatan": t.revenue
        }));
        const txData = (tables?.recent_transactions || []).map((tx: any) => ({
          "Invoice": tx.invoice_number,
          "Member": tx.member_name,
          "Cabang": tx.branch_name || "-",
          "Metode": tx.payment_method || "OTHER",
          "Waktu": tx.paid_at || "-",
          "Total": tx.total_amount
        }));

        const sheets: any[] = [
          { sheetName: "Ringkasan", data: summaryData },
          { sheetName: "Tren Pendapatan", data: trendData },
          { sheetName: "Metode Pembayaran", data: methodData },
        ];
        if (branchData.length > 0) {
          sheets.push({ sheetName: "Top Cabang", data: branchData });
        }
        sheets.push({ sheetName: "Transaksi", data: txData });

        exportToExcel(sheets, `Owner_Finance_Report${branchSuffix}_${startDate}_${endDate}`);
      } else if (currentTab === "member") {
        const summaryData = [{
          "Member Baru": summary?.new_members || 0,
          "Churn": summary?.churned_members || 0,
          "Net Growth": summary?.net_growth || 0
        }];
        const trendData = (charts?.registration_trend || []).map((t: any) => ({
          "Tanggal": t.date,
          "Total": t.total
        }));
        const planData = (charts?.plan_distribution || []).map((p: any) => ({
          "Paket": p.name,
          "Jumlah": p.value
        }));
        const branchDistData = (charts?.branch_distribution || []).map((b: any) => ({
          "Cabang": b.name,
          "Jumlah Member": b.value
        }));
        const newMembersData = (tables?.new_members || []).map((m: any) => ({
          "Nama": m.name,
          "Email": m.email || "-",
          "Telepon": m.phone || "-",
          "Cabang": m.branch_name,
          "Status": m.status || "-",
          "Bergabung": m.created_at || "-"
        }));

        const sheets: any[] = [
          { sheetName: "Ringkasan", data: summaryData },
          { sheetName: "Tren Pendaftaran", data: trendData },
          { sheetName: "Distribusi Paket", data: planData },
        ];
        if (branchDistData.length > 0) {
          sheets.push({ sheetName: "Distribusi Cabang", data: branchDistData });
        }
        sheets.push({ sheetName: "Member Baru", data: newMembersData });

        exportToExcel(sheets, `Owner_Member_Report${branchSuffix}_${startDate}_${endDate}`);
      } else if (currentTab === "membership") {
        const summaryData = [{
          "Membership Aktif": summary?.active_count || 0,
          "Expired (Periode)": summary?.expired_count || 0,
          "Frozen": summary?.frozen_count || 0
        }];
        const planData = (charts?.plan_distribution || []).map((p: any) => ({
          "Paket": p.name,
          "Jumlah": p.value
        }));
        const expiringData = (tables?.expiring_soon || []).map((s: any) => ({
          "Member": s.member_name,
          "Paket": s.plan_name,
          "Cabang": s.branch_name,
          "Berakhir": s.ends_at,
          "Sisa Hari": s.days_left
        }));
        const frozenData = (tables?.frozen_list || []).map((s: any) => ({
          "Member": s.member_name,
          "Paket": s.plan_name,
          "Frozen Sejak": s.frozen_at,
          "Frozen Sampai": s.frozen_until
        }));
        exportToExcel([
          { sheetName: "Ringkasan", data: summaryData },
          { sheetName: "Distribusi Plan", data: planData },
          { sheetName: "Akan Expired", data: expiringData },
          { sheetName: "Frozen Memberships", data: frozenData },
        ], `Owner_Membership_Report${branchSuffix}_${startDate}_${endDate}`);
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

  const handleFilterChange = useCallback((range: { start: string; end: string }) => {
    setStartDate(range.start);
    setEndDate(range.end);
  }, []);

  const isFiltered = selectedBranch !== "all";

  return (
    <div className="space-y-6 pb-10 bg-white p-5 rounded-xl border border-gray-500/20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Laporan Gym</h1>
          <p className="text-sm text-zinc-500">
            {isFiltered
              ? <>Analitik mendalam untuk cabang <span className="font-semibold text-aksen-secondary">{selectedBranchName}</span>.</>
              : "Analitik mendalam untuk seluruh cabang Anda."
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Branch Selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
                isFiltered
                  ? "bg-aksen-secondary/10 border-aksen-secondary text-aksen-secondary"
                  : "bg-white border-gray-200 text-zinc-600 hover:border-aksen-secondary/50"
              }`}
            >
              <Building2 size={16} />
              <span className="max-w-[160px] truncate">{selectedBranchName}</span>
              <ChevronDown size={14} className={`transition-transform ${isBranchDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isBranchDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2">
                  <p className="text-xs text-zinc-400 font-medium px-3 py-2 uppercase tracking-wider">Pilih Cabang</p>

                  {/* All Branches */}
                  <button
                    onClick={() => handleBranchSelect("all")}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                      selectedBranch === "all"
                        ? "bg-aksen-secondary/10 text-aksen-secondary font-semibold"
                        : "text-zinc-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${selectedBranch === "all" ? "bg-aksen-secondary" : "bg-gray-300"}`} />
                    Semua Cabang
                  </button>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-1" />

                  {/* Branch List */}
                  {isBranchesLoading ? (
                    <div className="flex items-center justify-center py-4 text-zinc-400">
                      <Loader2 size={16} className="animate-spin mr-2" />
                      <span className="text-sm">Memuat cabang...</span>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto">
                      {(branches || []).map((branch) => (
                        <button
                          key={branch.id}
                          onClick={() => handleBranchSelect(branch.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer ${
                            selectedBranch === branch.id
                              ? "bg-aksen-secondary/10 text-aksen-secondary font-semibold"
                              : "text-zinc-700 hover:bg-gray-50"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${selectedBranch === branch.id ? "bg-aksen-secondary" : "bg-gray-300"}`} />
                          {branch.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Export Button */}
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
      </div>

      {/* Branch Filter Badge */}
      {isFiltered && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-aksen-secondary/10 text-aksen-secondary rounded-full text-xs font-semibold">
            <Building2 size={12} />
            {selectedBranchName}
          </span>
          <button
            onClick={() => setSelectedBranch("all")}
            className="text-xs text-zinc-400 hover:text-zinc-600 underline cursor-pointer transition-colors"
          >
            Lihat Semua Cabang
          </button>
        </div>
      )}

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

      {/* TAB CONTENT */}
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
              <OwnerFinanceTab
                data={data?.data}
                startDate={startDate}
                endDate={endDate}
                onFilterChange={handleFilterChange}
                isFiltered={isFiltered}
              />
            )}
            {currentTab === "member" && <OwnerMemberTab data={data?.data} isFiltered={isFiltered} />}
            {currentTab === "membership" && <OwnerMembershipTab data={data?.data} isFiltered={isFiltered} />}
          </>
        )}
      </div>
    </div>
  );
}
