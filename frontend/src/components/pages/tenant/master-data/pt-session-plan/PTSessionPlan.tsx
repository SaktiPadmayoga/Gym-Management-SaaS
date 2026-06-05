"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { PtSessionPlanData, PtSessionPlanWithKeyword } from "@/types/tenant/pt-session-plans";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { usePtSessionPlans, useDeletePtSessionPlan, useTogglePtSessionPlan, useDuplicatePtSessionPlan } from "@/hooks/tenant/usePtSessionPlans";
import { useDebounce } from "@/hooks/useDebounce";

export default function PtSessionPlan() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<PtSessionPlanWithKeyword>({
        defaultValues: { search: searchParams.get("search") || "" },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = usePtSessionPlans({
        search: debouncedSearch,
        page,
        per_page: perPage,
    });

    const deleteMutation = useDeletePtSessionPlan();
    const toggleMutation = useTogglePtSessionPlan();
    const duplicateMutation = useDuplicatePtSessionPlan();

    // Sync URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/pt-sessions-plans?${params.toString()}`);
    }, [debouncedSearch, page, perPage, router]);

    // Toast
    useEffect(() => {
        const success = searchParams.get("success");
        const updated = searchParams.get("updated");
        const deleted = searchParams.get("deleted");

        if (!success && !updated && !deleted) {
            hasShownToast.current = false;
            return;
        }
        if (success === "true" && !hasShownToast.current) {
            toast.success("Paket sesi PT berhasil dibuat");
            hasShownToast.current = true;
        }
        if (updated === "true" && !hasShownToast.current) {
            toast.success("Paket sesi PT berhasil diperbarui");
            hasShownToast.current = true;
        }
        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Paket sesi PT berhasil dihapus");
            hasShownToast.current = true;
        }

        window.history.replaceState({}, "", "/pt-sessions-plans");
    }, [searchParams]);

    const entries: PtSessionPlanData[] = data ?? [];
    const totalData = entries.length;

    if (isError) {
        toast.error("Gagal memuat paket sesi PT");
        return <div className="py-10 text-center text-red-500">Gagal memuat paket sesi PT</div>;
    }

    /* =========================
     * TABLE COLUMNS
     * ========================= */
    const columns: Column<PtSessionPlanData>[] = [
        {
            header: "Nama",
            render: (item) => (
                <div className="flex items-center gap-2">
                    {item.color && <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />}
                    <Link href={`/pt-sessions-plans/${item.id}`} className="font-medium hover:underline">
                        {item.name}
                    </Link>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Kategori",
            render: (item) => <span className="rounded-lg px-2 py-1 text-xs font-medium bg-zinc-100 text-zinc-600">{item.category}</span>,
            width: "w-36",
        },
        {
            header: "Durasi",
            render: (item) => {
                const unitMap: Record<string, string> = {
                    day: "Hari",
                    days: "Hari",
                    week: "Minggu",
                    weeks: "Minggu",
                    month: "Bulan",
                    months: "Bulan",
                    year: "Tahun",
                    years: "Tahun",
                };
                const displayUnit = unitMap[item.duration_unit.toLowerCase()] ?? item.duration_unit;
                return (
                    <span className="text-sm text-zinc-700">
                        {item.duration} {displayUnit}
                    </span>
                );
            },
            width: "w-28",
        },
        {
            header: "Sesi",
            render: (item) => (
                <div className="text-sm text-zinc-700">
                    <p className="font-medium">{item.total_sessions}x</p>
                    <p className="text-xs text-zinc-400">{item.minutes_per_session} menit / sesi</p>
                </div>
            ),
            width: "w-32",
        },
        {
            header: "Harga",
            render: (item) => <span className="font-medium text-zinc-800">Rp {Number(item.price).toLocaleString("id-ID")}</span>,
            width: "w-36",
        },
        {
            header: "Poin Loyalitas",
            render: (item) => <span className="text-sm text-zinc-600">{item.loyalty_points_reward} poin</span>,
            width: "w-32",
        },
        {
            header: "Kuota",
            render: (item) => <span className="text-sm text-zinc-600">{item.unlimited_sold ? "Tak Terbatas" : `Sisa ${item.remaining_quota ?? "-"}`}</span>,
            width: "w-28",
        },
        {
            header: "Status",
            render: (item) =>
                item.is_active ? (
                    <span className="text-green-600 rounded-lg px-2 py-1 bg-green-600/10 font-medium text-sm">Aktif</span>
                ) : (
                    <span className="text-zinc-500 rounded-lg px-2 py-1 bg-zinc-300/10 font-medium text-sm">Tidak Aktif</span>
                ),
            width: "w-24",
        },
    ];

    /* =========================
     * ROW ACTIONS
     * ========================= */
    const actions: ActionItem<PtSessionPlanData>[] = [
        {
            label: "Lihat Detail",
            icon: "eye",
            onClick: (row) => router.push(`/pt-sessions-plans/${row.id}`),
        },
        {
            label: "Ubah",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/pt-sessions-plans/${row.id}`),
        },
        {
            label: (row) => (row.is_active ? "Nonaktifkan" : "Aktifkan"),
            icon: "eye",
            onClick: (row) => {
                toggleMutation.mutate(row.id, {
                    onSuccess: () => toast.success(`Paket sesi PT berhasil ${row.is_active ? "dinonaktifkan" : "diaktifkan"}`),
                    onError: () => toast.error("Gagal memperbarui status"),
                });
            },
        },
        {
            label: "Duplikat",
            icon: "edit",
            onClick: (row) => {
                duplicateMutation.mutate(row.id, {
                    onSuccess: () => toast.success("Paket sesi PT berhasil diduplikat"),
                    onError: () => toast.error("Gagal menduplikat paket"),
                });
            },
        },
        {
            label: "Hapus",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm("Apakah Anda yakin ingin menghapus paket sesi PT ini?")) {
                    deleteMutation.mutate(row.id, {
                        onSuccess: () => toast.success("Paket sesi PT berhasil dihapus"),
                        onError: () => toast.error("Gagal menghapus paket"),
                    });
                }
            },
        },
    ];

    return (
        <FormProvider {...form}>
            <div>
                <div className="rounded-xl font-figtree bg-white border border-gray-500/20 px-6 py-4">
                    <Toaster position="top-center" />

                    {/* Breadcrumb */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Master Data</li>
                            <li className="text-aksen-secondary">Paket Sesi PT</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Paket Sesi PT</h1>
                            <p className="text-zinc-500">Kelola paket sesi Personal Trainer yang tersedia untuk pelanggan</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" placeholder="Cari paket sesi PT..." />
                            </div>
                            <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/pt-sessions-plans/create")}>
                                Paket Baru
                            </CustomButton>
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
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/pt-sessions-plans/${row.id}`)} />
                        )}
                    </div>

                    <div className="mt-4 text-sm text-zinc-500">
                        Menampilkan {entries.length > 0 ? 1 : 0} sampai {entries.length} dari {totalData} data
                    </div>
                    <div className="mt-4">
                        <PaginationWithRows hasNextPage={false} hasPrevPage={false} totalItems={totalData} rowOptions={[5, 10, 15, 20, 50]} defaultRowsPerPage={perPage} />
                    </div>
                </div>
            </div>
        </FormProvider>
    );
}
