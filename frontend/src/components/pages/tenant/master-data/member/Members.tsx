"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { MemberData, MemberDataWithKeyword } from "@/types/tenant/members";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useMembers, useDeleteMember } from "@/hooks/tenant/useMembers";
import { useDebounce } from "@/hooks/useDebounce";

/* =========================
 * STATUS BADGE
 * ========================= */

const memberStatusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-zinc-100 text-zinc-500",
    expired: "bg-orange-100 text-orange-700",
    frozen: "bg-blue-100 text-blue-700",
    banned: "bg-red-100 text-red-700",
};

const statusLabels: Record<string, string> = {
    active: "Aktif",
    inactive: "Tidak Aktif",
    expired: "Kedaluwarsa",
    frozen: "Ditangguhkan",
    banned: "Diblokir",
};

export default function Members() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<MemberDataWithKeyword>({
        defaultValues: { search: searchParams.get("search") || "" },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = useMembers({
        search: debouncedSearch,
        page,
        per_page: perPage,
    });

    const deleteMutation = useDeleteMember();

    // Sync URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/members?${params.toString()}`);
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
            toast.success("Anggota berhasil dibuat");
            hasShownToast.current = true;
        }
        if (updated === "true" && !hasShownToast.current) {
            toast.success("Anggota berhasil diperbarui");
            hasShownToast.current = true;
        }
        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Anggota berhasil dihapus");
            hasShownToast.current = true;
        }

        window.history.replaceState({}, "", "/members");
    }, [searchParams]);

    const entries: MemberData[] = data ?? [];
    const totalData = entries.length;

    if (isError) {
        toast.error("Gagal memuat anggota");
        return <div className="py-10 text-center text-red-500">Gagal memuat anggota</div>;
    }

    /* =========================
     * TABLE COLUMNS
     * ========================= */
    const columns: Column<MemberData>[] = [
        {
            header: "Nama",
            render: (item) => (
                <div className="flex items-center gap-2">
                    {item.avatar_url ? (
                        <img src={item.avatar_url} alt={item.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-semibold text-sm">{item.name.charAt(0).toUpperCase()}</div>
                    )}
                    <div>
                        <Link href={`/members/${item.id}`} className="font-medium text-zinc-800 hover:underline">
                            {item.name}
                        </Link>
                        {item.home_branch && <p className="text-xs text-zinc-400">Utama: {item.home_branch.name}</p>}
                    </div>
                </div>
            ),
            width: "w-52",
        },
        {
            header: "Kontak",
            render: (item) => (
                <div>
                    <p className="text-sm text-zinc-700">{item.phone ?? "-"}</p>
                    <p className="text-xs text-zinc-400">{item.email ?? ""}</p>
                </div>
            ),
            width: "w-44",
        },
        {
            header: "Status",
            render: (item) => <span className={`rounded-lg px-2 py-1 text-xs font-medium capitalize ${memberStatusColor[item.status] ?? "bg-zinc-100 text-zinc-600"}`}>{statusLabels[item.status] ?? item.status}</span>,
            width: "w-28",
        },
        {
            header: "Keanggotaan",
            render: (item) => {
                // Cari membership yang sedang aktif, atau ambil yang paling pertama jika tidak ada yang aktif
                const mb = item.active_membership ?? item.memberships?.find((m) => m.status === "active");
                if (!mb) return <span className="text-zinc-400 text-sm">Tanpa keanggotaan</span>;

                // Kalkulasi sisa hari
                let daysLeft = 0;
                if (mb.end_date) {
                    const end = new Date(mb.end_date);
                    const today = new Date();
                    // Reset waktu ke tengah malam agar kalkulasi hari akurat
                    today.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);
                    const diffTime = end.getTime() - today.getTime();
                    daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                }

                return (
                    <div>
                        <p className="text-sm text-zinc-700 font-medium">{mb.plan?.name ?? "Custom Plan"}</p>
                        <p className="text-xs text-zinc-500 mb-1">Berakhir: {mb.end_date ? new Date(mb.end_date).toLocaleDateString("id-ID") : "-"}</p>
                        {mb.status === "active" && daysLeft !== null && (
                            <p className={`text-[10px] font-semibold uppercase ${daysLeft <= 7 ? "text-orange-500" : "text-emerald-500"}`}>{daysLeft > 0 ? `${daysLeft} hari tersisa` : "Habis hari ini"}</p>
                        )}
                        {mb.status !== "active" && <p className="text-[10px] font-semibold uppercase text-zinc-400">{statusLabels[mb.status] ?? mb.status}</p>}
                    </div>
                );
            },
            width: "w-48",
        },
        {
            header: "Jenis Kelamin",
            render: (item) => <span className="text-sm text-zinc-500 capitalize">{item.gender === "male" ? "Laki-laki" : item.gender === "female" ? "Perempuan" : item.gender ?? "-"}</span>,
            width: "w-24",
        },
        {
            header: "Anggota Sejak",
            render: (item) => <span className="text-sm text-zinc-500">{item.member_since ? new Date(item.member_since).toLocaleDateString("id-ID") : "-"}</span>,
            width: "w-32",
        },
        {
            header: "Check-in Terakhir",
            render: (item) => <span className="text-sm text-zinc-500">{item.last_checkin_at ? new Date(item.last_checkin_at).toLocaleDateString("id-ID") : "-"}</span>,
            width: "w-32",
        },
    ];

    /* =========================
     * ROW ACTIONS
     * ========================= */
    const actions: ActionItem<MemberData>[] = [
        {
            label: "Lihat Detail",
            icon: "eye",
            onClick: (row) => router.push(`/members/${row.id}`),
        },
        {
            label: "Ubah",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/members/${row.id}/edit`),
        },
        {
            label: "Hapus",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm("Apakah Anda yakin ingin menghapus anggota ini?")) {
                    deleteMutation.mutate(row.id, {
                        onSuccess: () => toast.success("Anggota berhasil dihapus"),
                        onError: () => toast.error("Gagal menghapus anggota"),
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
                            <li>Manajemen</li>
                            <li className="text-aksen-secondary">Anggota</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Anggota</h1>
                            <p className="text-zinc-500">Kelola anggota gym dan keanggotaan mereka</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" placeholder="Cari anggota..." />
                            </div>
                            <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/members/create")}>
                                Anggota Baru
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
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/members/${row.id}`)} />
                        )}
                    </div>

                    <div className="mt-4 text-sm text-zinc-500">
                        Menampilkan {entries.length > 0 ? 1 : 0} sampai {entries.length} dari {totalData} data
                    </div>
                </div>

                <div className="mt-4">
                    <PaginationWithRows hasNextPage={false} hasPrevPage={false} totalItems={totalData} rowOptions={[5, 10, 15, 20, 50]} defaultRowsPerPage={perPage} />
                </div>
            </div>
        </FormProvider>
    );
}
