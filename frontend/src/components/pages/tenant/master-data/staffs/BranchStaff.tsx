"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { StaffData, StaffDataWithKeyword } from "@/types/tenant/staffs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useStaff, useDeleteStaff } from "@/hooks/tenant/useStaffs";
import { useDebounce } from "@/hooks/useDebounce";
import { useBranch } from "@/providers/BranchProvider";
import { useStaffAuth } from "@/providers/StaffAuthProvider";

export default function BranchStaffs() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);
    const { branchId } = useBranch();
    const { staff: currentStaff } = useStaffAuth();

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<StaffDataWithKeyword>({
        defaultValues: {
            search: searchParams.get("search") || "",
        },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = useStaff({
        search: debouncedSearch,
        page,
        per_page: perPage,
        ...(branchId ? { branch_id: branchId } : {}), // ✅ scoped ke branch
    });

    const deleteMutation = useDeleteStaff();

    /* =========================
     * SYNC URL PARAMS
     * ========================= */
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));

        router.replace(`/staffs?${params.toString()}`);
    }, [debouncedSearch, page, perPage, router]);

    /* =========================
     * TOAST HANDLER
     * ========================= */
    useEffect(() => {
        const success = searchParams.get("success");
        const updated = searchParams.get("updated");
        const deleted = searchParams.get("deleted");

        if (!success && !updated && !deleted) {
            hasShownToast.current = false;
            return;
        }

        if (success === "true" && !hasShownToast.current) {
            toast.success("Staf berhasil ditambahkan");
            hasShownToast.current = true;
        }

        if (updated === "true" && !hasShownToast.current) {
            toast.success("Staf berhasil diperbarui");
            hasShownToast.current = true;
        }

        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Staf berhasil dihapus");
            hasShownToast.current = true;
        }

        window.history.replaceState({}, "", "/staffs");
    }, [searchParams]);

    const entries: StaffData[] = data?.data ?? [];
    const totalData = entries.length;

    if (isError) {
        toast.error("Gagal memuat data staf");
        return <div className="py-10 text-center text-red-500">Gagal memuat data staf</div>;
    }

    /* =========================
     * ROLE BADGE COLOR & LABEL
     * ========================= */
    const branchRoleColor: Record<string, string> = {
        branch_manager: "bg-purple-100 text-purple-700",
        trainer: "bg-blue-100 text-blue-700",
        receptionist: "bg-teal-100 text-teal-700",
        cashier: "bg-orange-100 text-orange-700",
    };

    const globalRoleColor: Record<string, string> = {
        owner: "bg-indigo-100 text-indigo-700",
        staff: "bg-zinc-100 text-zinc-600",
    };

    const roleLabel: Record<string, string> = {
        owner: "Pemilik",
        staff: "Staf",
        branch_manager: "Manajer Cabang",
        trainer: "Trainer",
        receptionist: "Resepsionis",
        cashier: "Kasir",
    };

    /* =========================
     * TABLE COLUMNS
     * ========================= */
    const columns: Column<StaffData>[] = [
        {
            header: "Nama",
            render: (item) => (
                <Link href={`/staffs/${item.id}`} className="font-medium hover:underline">
                    {item.name}
                </Link>
            ),
            width: "w-48",
        },
        {
            header: "Email",
            render: (item) => <span className="text-zinc-600">{item.email}</span>,
            width: "w-56",
        },
        {
            header: "Telepon",
            render: (item) => <span className="text-zinc-500">{item.phone ?? "-"}</span>,
            width: "w-36",
        },
        {
            header: "Peran",
            render: (item) => <span className={`rounded-lg px-2 py-1 text-sm font-medium ${globalRoleColor[item.role] ?? "bg-zinc-100 text-zinc-600"}`}>{roleLabel[item.role] ?? item.role}</span>,
            width: "w-32",
        },
        {
            header: "Cabang",
            render: (item) => {
                const branches = item.branches ?? [];

                if (branches.length === 0) {
                    return <span className="text-zinc-400 text-sm">Tidak ada cabang</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1">
                        {branches.slice(0, 2).map((sb) => (
                            <span key={sb.id} className={`rounded-md px-2 py-0.5 text-xs font-medium ${branchRoleColor[sb.role] ?? "bg-zinc-100 text-zinc-600"}`}>
                                {sb.branch?.name ?? sb.branch_id} ({roleLabel[sb.role] ?? sb.role})
                            </span>
                        ))}
                        {branches.length > 2 && <span className="rounded-md px-2 py-0.5 text-xs bg-zinc-100 text-zinc-500">+{branches.length - 2} lainnya</span>}
                    </div>
                );
            },
            width: "w-52",
        },
        {
            header: "Status",
            render: (item) =>
                item.is_active ? (
                    <span className="text-green-600 rounded-lg px-2 py-1 bg-green-600/10 font-medium text-sm">Aktif</span>
                ) : (
                    <span className="text-zinc-500 rounded-lg px-2 py-1 bg-zinc-300/10 font-medium text-sm">Tidak Aktif</span>
                ),
            width: "w-32",
        },
        {
            header: "Login Terakhir",
            render: (item) => <span className="text-sm text-zinc-500">{item.last_login_at ? new Date(item.last_login_at).toLocaleDateString() : "-"}</span>,
            width: "w-36",
        },
    ];

    /* =========================
     * ROW ACTIONS
     * ========================= */
    const actions: ActionItem<StaffData>[] = [
        {
            label: "Lihat Detail",
            icon: "eye",
            onClick: (row) => router.push(`/staffs/${row.id}`),
        },
        {
            label: "Ubah",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/staffs/${row.id}`),
        },
        {
            label: "Hapus",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            disabled: (row) => currentStaff?.id === row.id,
            onClick: (row) => {
                if (confirm("Apakah Anda yakin ingin menghapus staf ini?")) {
                    deleteMutation.mutate(row.id, {
                        onSuccess: () => toast.success("Staf berhasil dihapus"),
                        onError: () => toast.error("Gagal menghapus staf"),
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
                            <li className="text-aksen-secondary">Staf</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Staf</h1>
                            <p className="text-zinc-500">Kelola staf di cabang ini</p>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" placeholder="Cari staf..." />
                            </div>
                            <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/staffs/create")}>
                                Staf Baru
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
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/staffs/${row.id}`)} />
                        )}
                    </div>

                    <div className="mt-4 text-sm text-zinc-500">
                        Menampilkan {entries.length > 0 ? 1 : 0} sampai {entries.length} dari {totalData} data
                    </div>
                    {/* Pagination */}
                    <div className="mt-4">
                        <PaginationWithRows hasNextPage={false} hasPrevPage={false} totalItems={totalData} rowOptions={[5, 10, 15, 20, 50]} defaultRowsPerPage={perPage} />
                    </div>
                </div>
            </div>
        </FormProvider>
    );
}
