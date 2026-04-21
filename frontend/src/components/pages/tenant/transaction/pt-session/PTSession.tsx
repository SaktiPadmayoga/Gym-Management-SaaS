"use client";

import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import CustomTable, { ActionItem, Column } from "@/components/ui/table/CustomTable";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useDebounce } from "@/hooks/useDebounce";

// Sesuaikan path import ini dengan lokasi file types dan hooks kamu
import { PtSessionData } from "@/types/tenant/pt";
import { usePtSessions, useCancelPtSession } from "@/hooks/tenant/usePtSessions"; 



const statusColor: Record<string, string> = {
    scheduled:  "bg-blue-100 text-blue-700",
    ongoing:    "bg-yellow-100 text-yellow-700",
    completed:  "bg-green-100 text-green-700",
    cancelled:  "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
    scheduled:  "Terjadwal",
    ongoing:    "Berlangsung",
    completed:  "Selesai",
    cancelled:  "Dibatalkan",
};

// =============================================
// LIST TAB
// =============================================
function ListTab() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage]       = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);
    const [status, setStatus]   = useState(() => searchParams.get("status") || "");
    const [date, setDate]       = useState(() => searchParams.get("date") || "");

    const form = useForm({ defaultValues: { search: searchParams.get("search") || "" } });
    const debouncedSearch = useDebounce(form.watch("search"), 500);

    const { data, isLoading, isError } = usePtSessions({
        page,
        per_page: perPage,
        status,
        date,
        search: debouncedSearch,
    });

    const deleteMutation = useCancelPtSession();

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (status) params.set("status", status);
        if (date) params.set("date", date);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/pt-sessions?tab=list&${params.toString()}`);
    }, [debouncedSearch, page, perPage, status, date, router]);

    useEffect(() => {
        const success = searchParams.get("success");
        if (success === "true" && !hasShownToast.current) {
            toast.success("Jadwal PT berhasil dibuat");
            hasShownToast.current = true;
            window.history.replaceState({}, "", "/pt-sessions");
        }
    }, [searchParams]);

    const entries: PtSessionData[] = data?.data ?? [];
    const meta = data?.meta;

    if (isError) {
        toast.error("Gagal memuat jadwal PT");
        return <div className="py-10 text-center text-red-500">Error loading PT sessions</div>;
    }

    const columns: Column<PtSessionData>[] = [
        {
            header: "Member",
            render: (item: PtSessionData) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-semibold text-sm shrink-0">
                        {item.member?.name?.charAt(0).toUpperCase() || "M"}
                    </div>
                    <div>
                        <p className="font-medium text-zinc-800">{item.member?.name ?? "—"}</p>
                        <p className="text-xs text-zinc-400">{item.member?.phone ?? ""}</p>
                    </div>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Pelatih (Trainer)",
            render: (item: PtSessionData) => (
                <span className="text-sm font-medium text-zinc-700">{item.trainer?.name ?? "—"}</span>
            ),
            width: "w-40",
        },
        {
            header: "Paket PT",
            render: (item: PtSessionData) => (
                <div className="flex items-center gap-2">
                    {item.package?.plan?.color && (
                        <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: item.package.plan.color }}
                        />
                    )}
                    <div>
                        <p className="text-sm font-medium text-zinc-700">{item.package?.plan?.name ?? "—"}</p>
                        <p className="text-xs text-zinc-400">{item.package?.plan?.category ?? ""}</p>
                    </div>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Tanggal & Waktu",
            render: (item: PtSessionData) => (
                <div>
                    <p className="text-sm font-medium text-zinc-700">
                        {item.date
                            ? new Date(item.date).toLocaleDateString("id-ID", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                              })
                            : "—"}
                    </p>
                    <p className="text-xs text-zinc-400">
                        {item.start_at?.slice(0, 5)} – {item.end_at?.slice(0, 5)}
                    </p>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Status",
            render: (item: PtSessionData) => (
                <span className={`rounded-lg px-2 py-1 text-xs font-medium ${statusColor[item.status] ?? "bg-zinc-100 text-zinc-500"}`}>
                    {statusLabel[item.status] ?? item.status}
                </span>
            ),
            width: "w-28",
        },
    ];

    const actions: ActionItem<PtSessionData>[] = [
        {
            label: "Lihat Detail",
            icon: "eye",
            onClick: (row: PtSessionData) => router.push(`/pt-sessions/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row: PtSessionData) => router.push(`/pt-sessions/${row.id}/edit`),
        },
        {
            label: "Batalkan Jadwal",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row: PtSessionData) => {
                if (row.status === "cancelled") {
                    toast.error("Jadwal sudah dibatalkan");
                    return;
                }
                const reason = prompt("Alasan pembatalan (opsional):");
                if (reason === null) return;
                deleteMutation.mutate(
                    { id: row.id, reason },
                    {
                        onSuccess: () => toast.success("Jadwal dibatalkan"),
                        onError: () => toast.error("Gagal membatalkan jadwal"),
                    }
                );
            },
        },
    ];

    return (
        <FormProvider {...form}>
            <div className="py-4">
                <div className="flex gap-3 items-center mb-6 flex-wrap justify-between">
                    <div className="flex gap-3 items-center flex-wrap">
                        <select
                            value={status}
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 bg-white focus:outline-none"
                        >
                            <option value="">Semua Status</option>
                            <option value="scheduled">Terjadwal</option>
                            <option value="ongoing">Berlangsung</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => { setDate(e.target.value); setPage(1); }}
                            className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-700 bg-white focus:outline-none"
                        />
                        <div className="w-64 text-zinc-800">
                            <SearchInput name="search" />
                        </div>
                    </div>
                    <CustomButton
                        iconName="plus"
                        className="text-white px-3"
                        onClick={() => router.push("/pt-sessions/create")}
                    >
                        Buat Jadwal
                    </CustomButton>
                </div>

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
                            actions={actions}
                            onRowClick={(row: PtSessionData) => router.push(`/pt-sessions/${row.id}`)}
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



// =============================================
// MAIN PAGE
// =============================================
export default function PtSchedules() {
    const searchParams = useSearchParams();

    return (
        <div className="font-figtree">
            <Toaster position="top-center" />
            <div className="rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                    <ul>
                        <li>Management</li>
                        <li className="text-aksen-secondary">Jadwal PT</li>
                    </ul>
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-800">Jadwal Personal Training</h1>
                        <p className="text-zinc-500">Kelola jadwal sesi latihan private</p>
                    </div>
                </div>

                <hr />

                <ListTab />

            </div>
        </div>
    );
}