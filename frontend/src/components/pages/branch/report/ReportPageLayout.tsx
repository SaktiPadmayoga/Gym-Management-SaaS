"use client";

import React from "react";
import { Loader2, Sheet, FileText } from "lucide-react";

interface ReportPageLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isLoading: boolean;
  isError: boolean;
  filterSlot: React.ReactNode;
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
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
  onExportPdf,
  isExportingPdf = false,
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

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onExportExcel && (
            <button
              onClick={onExportExcel}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors rounded-lg font-medium text-sm border border-emerald-200 shadow-sm"
            >
              <Sheet size={15} />
              Excel
            </button>
          )}

          {onExportPdf && (
            <button
              onClick={onExportPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors rounded-lg font-medium text-sm border border-rose-200 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isExportingPdf ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <FileText size={15} />
              )}
              {isExportingPdf ? "Membuat PDF..." : "PDF"}
            </button>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="border-b border-zinc-100 pb-4">{filterSlot}</div>

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
