"use client";

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import CustomTable, { Column } from "@/components/ui/table/CustomTable";
import { SearchInput } from "@/components/ui/input/Input";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useActiveMemberships, useMembershipHistory } from "@/hooks/tenant/useMemberships";
import { useDebounce } from "@/hooks/useDebounce";
import { MembershipDetail } from "@/types/tenant/memberships";

/* =========================
 * TYPES
 * ========================= */
type TabKey = "active" | "history";

const TABS = [
    { key: "active" as TabKey, label: "Membership Aktif" },
    { key: "history" as TabKey, label: "Riwayat" },
] as const;

const statusColor: Record<string, string> = {
    active:    "bg-green-100 text-green-700",
    expired:   "bg-red-100 text-red-700",
    frozen:    "bg-blue-100 text-blue-700",
    cancelled: "bg-zinc-100 text-zinc-500",
};

/* =========================
 * ACTIVE TAB
 * ========================= */
function ActiveTab() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [page, setPage]       = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);
    const [expiringDays, setExpiringDays] = useState<number | undefined>(undefined);

    const form = useForm({ defaultValues: { search: searchParams.get("search") || "" } });
    const debouncedSearch = useDebounce(form.watch("search"), 500);

    const { data, isLoading, isError } = useActiveMemberships({
        search: debouncedSearch,
        page,
        per_page: perPage,
        expiring_in_days: expiringDays,
    });

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/memberships?tab=active&${params.toString()}`);
    }, [debouncedSearch, page, perPage, router]);

    const entries: MembershipDetail[] = data?.data ?? [];
    const meta = data?.meta;

    if (isError) {
        toast.error("Gagal memuat data membership");
        return <div className="py-10 text-center text-red-500">Error loading memberships</div>;
    }

    const columns: Column<MembershipDetail>[] = [
        {
            header: "Member",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-semibold text-sm shrink-0">
                        {item.member?.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                        <button
                            onClick={() => router.push(`/members/${item.member_id}`)}
                            className="font-medium text-zinc-800 hover:underline text-left"
                        >
                            {item.member?.name ?? "—"}
                        </button>
                        <p className="text-xs text-zinc-400">{item.member?.phone ?? ""}</p>
                    </div>
                </div>
            ),
            width: "w-52",
        },
        {
            header: "Paket",
            render: (item) => (
                <div>
                    <p className="text-sm font-medium text-zinc-800">{item.plan?.name ?? "—"}</p>
                    <p className="text-xs text-zinc-400">
                        {item.unlimited_checkin ? "Unlimited" : `Sisa ${item.remaining_checkin_quota ?? "—"} visit`}
                    </p>
                </div>
            ),
            width: "w-44",
        },
        {
            header: "Mulai",
            render: (item) => (
                <span className="text-sm text-zinc-600">
                    {item.start_date
                        ? new Date(item.start_date).toLocaleDateString("id-ID", {
                              day: "numeric", month: "short", year: "numeric",
                          })
                        : "—"}
                </span>
            ),
            width: "w-32",
        },
        {
            header: "Berakhir",
            render: (item) => (
                <div>
                    <p className="text-sm text-zinc-600">
                        {item.end_date
                            ? new Date(item.end_date).toLocaleDateString("id-ID", {
                                  day: "numeric", month: "short", year: "numeric",
                              })
                            : "—"}
                    </p>
                    {item.days_remaining !== null && item.days_remaining !== undefined && (
                        <p className={`text-xs font-semibold ${
                            item.days_remaining <= 7 ? "text-red-500" :
                            item.days_remaining <= 30 ? "text-amber-500" : "text-green-600"
                        }`}>
                            {item.days_remaining > 0
                                ? `${item.days_remaining} hari lagi`
                                : "Berakhir hari ini"}
                        </p>
                    )}
                </div>
            ),
            width: "w-36",
        },
        {
            header: "Total Check-in",
            render: (item) => (
                <span className="text-sm font-medium text-zinc-700">{item.total_checkins ?? 0}x</span>
            ),
            width: "w-28",
        },
        {
            header: "Status",
            render: (item) => (
                <span className={`rounded-lg px-2 py-1 text-xs font-medium capitalize ${statusColor[item.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {item.status_label ?? item.status}
                </span>
            ),
            width: "w-24",
        },
    ];

    return (
        <FormProvider {...form}>
            <div className="py-4">
                {/* Filters */}
                <div className="flex gap-3 items-center mb-6 flex-wrap">
                    <select
                        value={expiringDays ?? ""}
                        onChange={(e) => {
                            setExpiringDays(e.target.value ? Number(e.target.value) : undefined);
                            setPage(1);
                        }}
                        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 bg-white focus:outline-none"
                    >
                        <option value="">Semua</option>
                        <option value="7">Berakhir dalam 7 hari</option>
                        <option value="14">Berakhir dalam 14 hari</option>
                        <option value="30">Berakhir dalam 30 hari</option>
                    </select>
                    <div className="w-64 text-zinc-800">
                        <SearchInput name="search" />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <CustomTable
                            columns={columns}
                            data={entries}
                            onRowClick={(row) => router.push(`/members/${row.member_id}`)}
                        />
                    )}
                </div>

                <div className="mt-4 text-sm text-zinc-500">
                    Showing {entries.length > 0 ? (page - 1) * perPage + 1 : 0} to{" "}
                    {(page - 1) * perPage + entries.length} of {meta?.total ?? entries.length} data
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
 * HISTORY TAB
 * ========================= */
function HistoryTab() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [page, setPage]       = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);
    const [status, setStatus]   = useState(() => searchParams.get("status") || "");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate]     = useState("");

    const form = useForm({ defaultValues: { search: searchParams.get("search") || "" } });
    const debouncedSearch = useDebounce(form.watch("search"), 500);

    const { data, isLoading, isError } = useMembershipHistory({
        search: debouncedSearch,
        page,
        per_page: perPage,
        status,
    });

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (status) params.set("status", status);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/memberships?tab=history&${params.toString()}`);
    }, [debouncedSearch, page, perPage, status, router]);

    const entries: MembershipDetail[] = data?.data ?? [];
    const meta = data?.meta;

    if (isError) {
        toast.error("Gagal memuat riwayat membership");
        return <div className="py-10 text-center text-red-500">Error loading history</div>;
    }

    const columns: Column<MembershipDetail>[] = [
        {
            header: "Member",
            render: (item) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-semibold text-sm shrink-0">
                        {item.member?.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                    <div>
                        <button
                            onClick={() => router.push(`/members/${item.member_id}`)}
                            className="font-medium text-zinc-800 hover:underline text-left"
                        >
                            {item.member?.name ?? "—"}
                        </button>
                        <p className="text-xs text-zinc-400">{item.member?.email ?? ""}</p>
                    </div>
                </div>
            ),
            width: "w-52",
        },
        {
            header: "Paket",
            render: (item) => (
                <div>
                    <p className="text-sm font-medium text-zinc-800">{item.plan?.name ?? "—"}</p>
                    <p className="text-xs text-zinc-400">
                        {item.plan?.price
                            ? `Rp ${Number(item.plan.price).toLocaleString("id-ID")}`
                            : "—"}
                    </p>
                </div>
            ),
            width: "w-44",
        },
        {
            header: "Periode",
            render: (item) => (
                <div>
                    <p className="text-xs text-zinc-500">
                        {item.start_date
                            ? new Date(item.start_date).toLocaleDateString("id-ID", {
                                  day: "numeric", month: "short", year: "numeric",
                              })
                            : "—"}
                        {" → "}
                        {item.end_date
                            ? new Date(item.end_date).toLocaleDateString("id-ID", {
                                  day: "numeric", month: "short", year: "numeric",
                              })
                            : "—"}
                    </p>
                </div>
            ),
            width: "w-52",
        },
        {
            header: "Total Check-in",
            render: (item) => (
                <span className="text-sm font-medium text-zinc-700">{item.total_checkins ?? 0}x</span>
            ),
            width: "w-28",
        },
        {
            header: "Cabang",
            render: (item) => (
                <span className="text-sm text-zinc-600">{item.branch?.name ?? "—"}</span>
            ),
            width: "w-36",
        },
        {
            header: "Status",
            render: (item) => (
                <span className={`rounded-lg px-2 py-1 text-xs font-medium capitalize ${statusColor[item.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {item.status_label ?? item.status}
                </span>
            ),
            width: "w-24",
        },
        {
            header: "Dibuat",
            render: (item) => (
                <span className="text-xs text-zinc-400">{item.created_at ?? "—"}</span>
            ),
            width: "w-32",
        },
    ];

    return (
        <FormProvider {...form}>
            <div className="py-4">
                {/* Filters */}
                <div className="flex gap-3 items-center mb-6 flex-wrap">
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 bg-white focus:outline-none"
                    >
                        <option value="">Semua Status</option>
                        <option value="active">Aktif</option>
                        <option value="expired">Kadaluarsa</option>
                        <option value="frozen">Dibekukan</option>
                        <option value="cancelled">Dibatalkan</option>
                    </select>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 bg-white focus:outline-none"
                        placeholder="Dari tanggal"
                    />
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                        className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 bg-white focus:outline-none"
                        placeholder="Sampai tanggal"
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
                                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <CustomTable
                            columns={columns}
                            data={entries}
                            onRowClick={(row) => router.push(`/members/${row.member_id}`)}
                        />
                    )}
                </div>

                <div className="mt-4 text-sm text-zinc-500">
                    Showing {entries.length > 0 ? (page - 1) * perPage + 1 : 0} to{" "}
                    {(page - 1) * perPage + entries.length} of {meta?.total ?? entries.length} data
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
export default function MembershipsPage() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabKey>(
        () => (searchParams.get("tab") as TabKey) || "active"
    );

    return (
        <div className="font-figtree">
            <Toaster position="top-center" />

            <div className="rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                {/* Breadcrumb */}
                <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                    <ul>
                        <li>Management</li>
                        <li className="text-aksen-secondary">Memberships</li>
                    </ul>
                </div>

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-800">Memberships</h1>
                        <p className="text-zinc-500">Kelola paket aktif dan riwayat membership member</p>
                    </div>
                </div>

                <hr />

                {/* Tabs */}
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

                {activeTab === "active"  && <ActiveTab />}
                {activeTab === "history" && <HistoryTab />}
            </div>
        </div>
    );
}