// app/(tenant)/check-ins/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { QrCode, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import CustomTable, { Column } from "@/components/ui/table/CustomTable";
import { SearchInput } from "@/components/ui/input/Input";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useCheckIns } from "@/hooks/tenant/useCheckIns";
import { useDebounce } from "@/hooks/useDebounce";
import { checkInsAPI } from "@/lib/api/tenant/checkIns";
import { getCurrentBranchId } from "@/lib/tenant-api-client";
import { CheckInData } from "@/types/tenant/checkIns";
import { useRouter, useSearchParams } from "next/navigation";

/* =========================
 * TYPES
 * ========================= */
type TabKey = "scanner" | "history";
type HistoryItem = { name: string; time: string; status: "success" | "failed" };
type ScanResult = { data?: CheckInData; message?: string; error?: string };

const TABS = [
    { key: "scanner" as TabKey, label: "Scanner" },
    { key: "history" as TabKey, label: "Riwayat Check-in" },
] as const;

const statusColor: Record<string, string> = {
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
};

/* =========================
 * SCANNER TAB
 * ========================= */
function ScannerTab() {
    const [qrInput, setQrInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-focus saat tab dibuka — tidak perlu klik
    useEffect(() => {
        const timer = setTimeout(() => inputRef.current?.focus(), 100);
        return () => clearTimeout(timer);
    }, []);

    // Auto-submit saat scanner inject token (UUID = 36 chars)
    useEffect(() => {
        if (qrInput.length >= 32 && !isProcessing) {
            const timer = setTimeout(() => handleScan(qrInput), 120);
            return () => clearTimeout(timer);
        }
    }, [qrInput, isProcessing]);

    async function handleScan(token = qrInput) {
        const trimmed = token.trim();
        if (!trimmed || isProcessing) return;

        const branchId = getCurrentBranchId();
        if (!branchId) {
            toast.error("Branch tidak ditemukan. Pastikan branch sudah dipilih.");
            return;
        }

        setIsProcessing(true);
        setResult(null);

        try {
            const res = await checkInsAPI.create({
                qr_token: trimmed,
                branch_id: branchId,
            });
            setResult({ data: res.data, message: res.message });
            setHistory((prev) =>
                [
                    {
                        name: res.data.member?.name ?? "—",
                        time: new Date().toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        status: "success" as const,
                    },
                    ...prev,
                ].slice(0, 20)
            );
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ?? "Check-in gagal. Coba scan ulang.";
            setResult({ error: msg });
            setHistory((prev) =>
                [
                    {
                        name: "—",
                        time: new Date().toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                        status: "failed" as const,
                    },
                    ...prev,
                ].slice(0, 20)
            );
        } finally {
            setIsProcessing(false);
            setQrInput("");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }

    function getInitials(name: string) {
        return name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();
    }

    const member = result?.data?.member;
    const membership = result?.data?.membership;

    return (
        <div className="max-w-md mx-auto py-4">
            {/* Scanner Input Card */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 mb-4">
                {/* Scanner Area — klik untuk refocus jika perlu */}
                <button
                    type="button"
                    onClick={() => inputRef.current?.focus()}
                    className="w-full border-2 border-dashed border-zinc-200 hover:border-zinc-400 rounded-2xl p-8 text-center transition-colors mb-5 group"
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-zinc-100 group-hover:bg-zinc-200 rounded-xl flex items-center justify-center transition-colors">
                            {isProcessing ? (
                                <RefreshCw size={22} className="text-zinc-400 animate-spin" />
                            ) : (
                                <QrCode size={22} className="text-zinc-400" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-700">
                                {isProcessing
                                    ? "Memproses check-in..."
                                    : "Siap menerima scan QR Code"}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Scanner fisik langsung aktif • Klik untuk refocus jika perlu
                            </p>
                        </div>
                    </div>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-zinc-100" />
                    <span className="text-xs text-zinc-400 font-medium">atau input manual</span>
                    <div className="flex-1 h-px bg-zinc-100" />
                </div>

                {/* Hidden input — auto-focused, menerima inject dari scanner fisik */}
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={qrInput}
                        onChange={(e) => setQrInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleScan()}
                        placeholder="Paste / ketik QR token..."
                        disabled={isProcessing}
                        className="flex-1 px-4 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 font-mono focus:outline-none focus:border-zinc-400 disabled:opacity-50 transition-colors"
                    />
                    <button
                        type="button"
                        onClick={() => handleScan()}
                        disabled={isProcessing || !qrInput.trim()}
                        className="px-4 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {isProcessing ? (
                            <RefreshCw size={15} className="animate-spin" />
                        ) : (
                            "Proses"
                        )}
                    </button>
                </div>
            </div>

            {/* Result Card */}
            {result && (
                <div
                    className={`rounded-2xl border p-6 mb-4 ${
                        result.error
                            ? "bg-red-50 border-red-200"
                            : "bg-green-50 border-green-200"
                    }`}
                >
                    {result.error ? (
                        <div className="flex items-start gap-3">
                            <XCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-bold text-red-700 text-sm">Check-in Gagal</p>
                                <p className="text-red-600 text-sm mt-0.5">{result.error}</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-11 h-11 rounded-full bg-green-200 flex items-center justify-center text-green-800 font-bold text-sm shrink-0">
                                    {getInitials(member?.name ?? "?")}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-zinc-900 text-sm">
                                        {member?.name ?? "—"}
                                    </p>
                                    <p className="text-xs text-zinc-500 truncate">
                                        {membership?.plan_name ?? "—"}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                                    <CheckCircle2 size={12} />
                                    Berhasil
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-white/70 rounded-xl p-3">
                                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mb-1">
                                        Kuota
                                    </p>
                                    <p className="text-sm font-bold text-zinc-900">
                                        {membership?.is_unlimited
                                            ? "Unlimited"
                                            : `${membership?.remaining_quota ?? "—"} visit`}
                                    </p>
                                </div>
                                <div className="bg-white/70 rounded-xl p-3">
                                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mb-1">
                                        Berakhir
                                    </p>
                                    <p className="text-sm font-bold text-zinc-900">
                                        {membership?.end_date
                                            ? new Date(membership.end_date).toLocaleDateString(
                                                  "id-ID",
                                                  {
                                                      day: "numeric",
                                                      month: "short",
                                                      year: "numeric",
                                                  }
                                              )
                                            : "—"}
                                    </p>
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-green-700">
                                {result.message ?? "Selamat latihan!"}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Session History */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                    Sesi ini
                </p>
                {history.length === 0 ? (
                    <div className="text-center py-6">
                        <p className="text-sm text-zinc-400">Belum ada scan dalam sesi ini</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {history.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 py-2.5 border-b border-zinc-100 last:border-0"
                            >
                                <div
                                    className={`w-2 h-2 rounded-full shrink-0 ${
                                        item.status === "success"
                                            ? "bg-green-500"
                                            : "bg-red-400"
                                    }`}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-zinc-800 truncate">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-zinc-400">{item.time}</p>
                                </div>
                                <span
                                    className={`text-xs font-bold ${
                                        item.status === "success"
                                            ? "text-green-600"
                                            : "text-red-500"
                                    }`}
                                >
                                    {item.status === "success" ? "Sukses" : "Gagal"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

/* =========================
 * HISTORY TAB
 * ========================= */
function HistoryTab() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(
        () => Number(searchParams.get("per_page")) || 15
    );
    const [date, setDate] = useState(
        () =>
            searchParams.get("date") || new Date().toISOString().split("T")[0]
    );
    const [status, setStatus] = useState(
        () => searchParams.get("status") || ""
    );

    const form = useForm({
        defaultValues: { search: searchParams.get("search") || "" },
    });
    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = useCheckIns({
        search: debouncedSearch,
        page,
        per_page: perPage,
        date,
        status,
    });

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (status) params.set("status", status);
        params.set("date", date);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/check-ins?tab=history&${params.toString()}`);
    }, [debouncedSearch, page, perPage, date, status, router]);

    const entries: CheckInData[] = data?.data ?? [];
    const meta = data?.meta;

    if (isError) {
        toast.error("Error loading check-ins");
        return (
            <div className="py-10 text-center text-red-500">
                Error loading check-ins
            </div>
        );
    }

    const columns: Column<CheckInData>[] = [
        {
            header: "Member",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-semibold text-sm shrink-0">
                        {item.member?.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <span className="font-medium text-zinc-800">
                        {item.member?.name ?? "—"}
                    </span>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Waktu Check-in",
            render: (item) => (
                <div>
                    <p className="text-sm text-zinc-700">
                        {new Date(item.checked_in_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                        })}
                    </p>
                    <p className="text-xs text-zinc-400">
                        {new Date(item.checked_in_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                    </p>
                </div>
            ),
            width: "w-40",
        },
        {
            header: "Paket",
            render: (item) =>
                item.membership ? (
                    <div>
                        <p className="text-sm font-medium text-zinc-700">
                            {item.membership.plan_name}
                        </p>
                        <p className="text-xs text-zinc-400">
                            {item.membership.is_unlimited
                                ? "Unlimited"
                                : `Sisa ${item.membership.remaining_quota ?? "—"} visit`}
                        </p>
                    </div>
                ) : (
                    <span className="text-zinc-400 text-sm">—</span>
                ),
            width: "w-44",
        },
        {
            header: "Status",
            render: (item) => (
                <span
                    className={`rounded-lg px-2 py-1 text-xs font-medium capitalize ${
                        statusColor[item.status] ?? "bg-zinc-100 text-zinc-500"
                    }`}
                >
                    {item.status}
                </span>
            ),
            width: "w-24",
        },
        {
            header: "Keterangan",
            render: (item) => (
                <span className="text-sm text-zinc-500">{item.notes ?? "—"}</span>
            ),
            width: "w-56",
        },
    ];

    return (
        <FormProvider {...form}>
            <div className="py-4">
                {/* Filters */}
                <div className="flex gap-3 items-center mb-6 flex-wrap">
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 bg-white focus:outline-none"
                    >
                        <option value="">Semua Status</option>
                        <option value="success">Sukses</option>
                        <option value="failed">Gagal</option>
                    </select>

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => {
                            setDate(e.target.value);
                            setPage(1);
                        }}
                        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 bg-white focus:outline-none"
                    />

                    <div className="w-64 text-zinc-800">
                        <SearchInput name="search" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-12 bg-gray-200 rounded animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <CustomTable columns={columns} data={entries} />
                    )}
                </div>

                <div className="mt-4 text-sm text-zinc-500">
                    Showing{" "}
                    {entries.length > 0 ? (page - 1) * perPage + 1 : 0} to{" "}
                    {(page - 1) * perPage + entries.length} of{" "}
                    {meta?.total ?? entries.length} data
                </div>

                <div className="mt-4">
                    <PaginationWithRows
                        hasNextPage={!!meta?.next_page_url}
                        hasPrevPage={!!meta?.prev_page_url}
                        totalItems={meta?.total ?? entries.length}
                        rowOptions={[15, 30, 50]}
                        defaultRowsPerPage={perPage}
                    />
                </div>
            </div>
        </FormProvider>
    );
}

/* =========================
 * MAIN PAGE
 * ========================= */
export default function CheckInsPage() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabKey>(
        () => (searchParams.get("tab") as TabKey) || "scanner"
    );

    return (
        <div className="font-figtree">
            <Toaster position="top-center" />

            <div className="rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                {/* Breadcrumb */}
                <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                    <ul>
                        <li>Management</li>
                        <li className="text-aksen-secondary">Check-ins</li>
                    </ul>
                </div>

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-800">
                            Check-ins
                        </h1>
                        <p className="text-zinc-500">
                            Scanner QR dan riwayat kehadiran member
                        </p>
                    </div>
                </div>

                <hr />

                {/* Tabs — sama persis dengan BranchSettings */}
                <div className="flex gap-1 mt-4 mb-6 border-b border-zinc-100">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition border-b-2 -mb-px ${
                                activeTab === tab.key
                                    ? "border-aksen-secondary text-aksen-secondary"
                                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === "scanner" && <ScannerTab />}
                {activeTab === "history" && <HistoryTab />}
            </div>
        </div>
    );
}