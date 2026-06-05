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
    active:   "bg-green-100 text-green-700",
    inactive: "bg-zinc-100 text-zinc-500",
    expired:  "bg-orange-100 text-orange-700",
    frozen:   "bg-blue-100 text-blue-700",
    banned:   "bg-red-100 text-red-700",
};

const memberStatusLabels: Record<string, string> = {
    active:   "Aktif",
    inactive: "Tidak Aktif",
    expired:  "Kedaluwarsa",
    frozen:   "Ditangguhkan",
    banned:   "Diblokir",
};

export default function Members() {
    const router       = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage]       = useState(() => Number(searchParams.get("page"))     || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<MemberDataWithKeyword>({
        defaultValues: { search: searchParams.get("search") || "" },
    });

    const searchValue     = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = useMembers({
        search:   debouncedSearch,
        page,
        per_page: perPage,
    });

    // Sync URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/owner/members?${params.toString()}`);
    }, [debouncedSearch, page, perPage, router]);

    // Toast
    useEffect(() => {
        const success = searchParams.get("success");
        const updated = searchParams.get("updated");
        const deleted = searchParams.get("deleted");

        if (!success && !updated && !deleted) { hasShownToast.current = false; return; }

        if (success === "true" && !hasShownToast.current) { toast.success("Member berhasil dibuat"); hasShownToast.current = true; }
        if (updated === "true" && !hasShownToast.current) { toast.success("Member berhasil diperbarui"); hasShownToast.current = true; }
        if (deleted === "true" && !hasShownToast.current) { toast.success("Member berhasil dihapus"); hasShownToast.current = true; }

        window.history.replaceState({}, "", "/owner/members");
    }, [searchParams]);

    const entries: MemberData[] = data ?? [];
    const totalData = entries.length;

    if (isError) {
        toast.error("Gagal memuat data member");
        return <div className="py-10 text-center text-red-500">Gagal memuat data member</div>;
    }

    /* =========================
     * TABLE COLUMNS
     * ========================= */
    const columns: Column<MemberData>[] = [
        {
            header: "Nama",
            render: (item) => (
                <div className="flex items-center gap-2">
                    {item.avatar_url     ? (
                        <img src={item.avatar_url} alt={item.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-semibold text-sm">
                            {item.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <div className="font-medium text-zinc-800 hover:underline">
                            {item.name}
                        </div>
                        {item.home_branch?.name && (
                            <p className="text-xs text-zinc-400">{item.home_branch.name}</p>
                        )}
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
            render: (item) => (
                <span className={`rounded-lg px-2 py-1 text-xs font-medium ${memberStatusColor[item.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                    {memberStatusLabels[item.status] ?? item.status}
                </span>
            ),
            width: "w-28",
        },
        {
            header: "Keanggotaan",
            render: (item) => {
                const mb = item.memberships?.[0];
                if (!mb) return <span className="text-zinc-400 text-sm">Tidak ada keanggotaan</span>;
                return (
                    <div>
                        <p className="text-sm text-zinc-700">
                            {mb.start_date ? new Date(mb.start_date).toLocaleDateString("id-ID") : "-"}
                        </p>
                        {mb.end_date !== null && mb.end_date !== undefined && (
                            <p className={`text-xs ${mb.end_date <= "7" ? "text-orange-500" : "text-zinc-400"}`}>
                                {mb.end_date > "0"
                                    ? `${mb.end_date} hari tersisa`
                                    : "Kedaluwarsa"}
                            </p>
                        )}
                    </div>
                );
            },
            width: "w-36",
        },
        {
            header: "Jenis Kelamin",
            render: (item) => (
                <span className="text-sm text-zinc-500">
                    {item.gender === "male" ? "Laki-laki" : item.gender === "female" ? "Perempuan" : item.gender ?? "-"}
                </span>
            ),
            width: "w-24",
        },
        {
            header: "Member Sejak",
            render: (item) => (
                <span className="text-sm text-zinc-500">
                    {item.member_since ? new Date(item.member_since).toLocaleDateString("id-ID") : "-"}
                </span>
            ),
            width: "w-32",
        },
        {
            header: "Check-in Terakhir",
            render: (item) => (
                <span className="text-sm text-zinc-500">
                    {item.last_checkin_at ? new Date(item.last_checkin_at).toLocaleDateString("id-ID") : "-"}
                </span>
            ),
            width: "w-32",
        },
    ];

    /* =========================
     * ROW ACTIONS
     * ========================= */
    const actions: ActionItem<MemberData>[] = [
        {
            label: "Lihat Detail",
            icon:  "eye",
            onClick: (row) => router.push(`/members/${row.id}`),
        },
    ];

    return (
        <FormProvider {...form}>
            <div>
                <div className="rounded-xl font-figtree bg-white border border-gray-500/20 px-6 py-4">
                    <Toaster position="top-center" />

                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Manajemen Pengguna</li>
                            <li className="text-aksen-secondary">Member</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Member</h1>
                            <p className="text-zinc-500">Kelola member gym dan keanggotaan mereka</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" placeholder="Cari member..." />
                            </div>
                        </div>
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
                                onRowClick={(row) => router.push(`/members/${row.id}`)}
                            />
                        )}
                    </div>

                    <div className="mt-4 text-sm text-zinc-500">
                        Menampilkan {entries.length > 0 ? 1 : 0} sampai {entries.length} dari {totalData} data
                    </div>
                    <div className="mt-4">
                        <PaginationWithRows
                            hasNextPage={entries.length > 0}
                            hasPrevPage={page > 1}
                            totalItems={totalData}
                            currentPage={page}
                            currentPerPage={perPage}
                            onPageChange={setPage}
                            onRowsPerPageChange={setPerPage}
                            rowOptions={[5, 10, 15, 20, 50]}
                            defaultRowsPerPage={perPage}
                        />
                    </div>
                </div>

            </div>
        </FormProvider>
    );
}