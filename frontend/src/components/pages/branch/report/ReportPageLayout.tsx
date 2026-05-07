"use client";

import React from "react";
import { Loader2, Download } from "lucide-react";

interface ReportPageLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
  isError: boolean;
  filterSlot: React.ReactNode;
  onExportExcel?: () => void;
  children: React.ReactNode;
}

export default function ReportPageLayout({
  title,
  description,
  icon,
  isLoading,
  isError,
  filterSlot,
  onExportExcel,
  children,
}: ReportPageLayoutProps) {
  return (
    <div className="space-y-6 pb-10 bg-white p-5 rounded-xl border border-gray-500/20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-aksen-secondary/10 text-aksen-secondary rounded-lg">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
            <p className="text-sm text-zinc-500">{description}</p>
          </div>
        </div>
        {onExportExcel && (
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors rounded-lg font-medium text-sm border border-green-200 shadow-sm"
          >
            <Download size={16} />
            Export Excel
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="border-b border-zinc-100 pb-4">
        {filterSlot}
      </div>

      {/* Content */}
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
          <div className="animate-in fade-in duration-500">{children}</div>
        )}
      </div>
    </div>
  );
}
