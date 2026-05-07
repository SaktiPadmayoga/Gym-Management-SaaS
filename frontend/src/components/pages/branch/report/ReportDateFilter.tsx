"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dayjs from "dayjs";

type DateRange = { start: string; end: string };

interface ReportDateFilterProps {
  startDate: string;
  endDate: string;
  onFilterChange: (range: DateRange) => void;
  showDatePicker?: boolean; // for daily report (single date)
  date?: string;
  onDateChange?: (date: string) => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ReportDateFilter({
  startDate,
  endDate,
  onFilterChange,
  showDatePicker = false,
  date,
  onDateChange,
}: ReportDateFilterProps) {
  const [period, setPeriod] = useState<"today" | "7d" | "30d" | "this_month" | "custom">("7d");
  const [localCustomRange, setLocalCustomRange] = useState<DateRange>({
    start: startDate,
    end: endDate,
  });

  const isInternalChange = useRef(false);
  const debouncedCustomRange = useDebounce(localCustomRange, 800);
  const periodRef = useRef(period);
  useEffect(() => { periodRef.current = period; }, [period]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    if (isInternalChange.current) { isInternalChange.current = false; return; }
    setLocalCustomRange({ start: startDate, end: endDate });
  }, [startDate, endDate]);

  useEffect(() => {
    if (periodRef.current !== "custom") return;
    if (!debouncedCustomRange.start || !debouncedCustomRange.end) return;
    if (debouncedCustomRange.start > debouncedCustomRange.end) return;
    isInternalChange.current = true;
    onFilterChange(debouncedCustomRange);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCustomRange]);

  const handlePeriodChange = useCallback((newPeriod: string) => {
    const now = dayjs();
    let range: DateRange;
    switch (newPeriod) {
      case "today": range = { start: now.format("YYYY-MM-DD"), end: now.format("YYYY-MM-DD") }; break;
      case "7d": range = { start: now.subtract(7, "day").format("YYYY-MM-DD"), end: now.format("YYYY-MM-DD") }; break;
      case "30d": range = { start: now.subtract(30, "day").format("YYYY-MM-DD"), end: now.format("YYYY-MM-DD") }; break;
      case "this_month": range = { start: now.startOf("month").format("YYYY-MM-DD"), end: now.endOf("month").format("YYYY-MM-DD") }; break;
      case "custom": setPeriod("custom"); return;
      default: range = { start: now.subtract(7, "day").format("YYYY-MM-DD"), end: now.format("YYYY-MM-DD") };
    }
    isInternalChange.current = true;
    setPeriod(newPeriod as typeof period);
    onFilterChange(range);
  }, [onFilterChange]);

  if (showDatePicker && onDateChange) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Tanggal:</span>
        <input
          type="date"
          value={date || dayjs().format("YYYY-MM-DD")}
          onChange={(e) => onDateChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-zinc-600 focus:outline-none focus:ring-1 focus:ring-aksen-secondary"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Periode:</span>
        <select
          value={period}
          onChange={(e) => handlePeriodChange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-aksen-secondary text-zinc-600"
        >
          <option value="today">Hari Ini</option>
          <option value="7d">7 Hari Terakhir</option>
          <option value="30d">30 Hari Terakhir</option>
          <option value="this_month">Bulan Ini</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>
      {period === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={localCustomRange.start}
            onChange={(e) => setLocalCustomRange((p) => ({ ...p, start: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-zinc-600"
          />
          <span className="text-sm text-zinc-600">-</span>
          <input
            type="date"
            value={localCustomRange.end}
            onChange={(e) => setLocalCustomRange((p) => ({ ...p, end: e.target.value }))}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-zinc-600"
          />
        </div>
      )}
    </div>
  );
}
