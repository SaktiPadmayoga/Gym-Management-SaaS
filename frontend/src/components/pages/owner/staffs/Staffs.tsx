"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { StaffData, StaffDataWithKeyword } from "@/types/tenant/staffs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm, Controller } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchableDropdown, DropdownOption } from "@/components/ui/input/CustomDropdown";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";

import { useStaff, useDeleteStaff } from "@/hooks/tenant/useStaffs";
import { useTenantBranches } from "@/hooks/useTenantBranches";
import { useDebounce } from "@/hooks/useDebounce";
import { useStaffAuth } from "@/providers/StaffAuthProvider";

interface FilterForm {
    search: string;
    branch_id?: string; // undefined = All Branches
}

export default function StaffList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);
    const { staff: currentStaff } = useStaffAuth();

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<FilterForm>({
        defaultValues: {
            search: searchParams.get("search") || "",
            branch_id: searchParams.get("branch_id") || undefined,
        },
    });

    const searchValue = form.watch("search");
    const selectedBranchId = form.watch("branch_id");

    const debouncedSearch = useDebounce(searchValue, 500);

    // Fetch semua branches untuk filter
    const { data: branchesResponse } = useTenantBranches();
    const branches = branchesResponse?.data ?? [];

    const branchOptions: DropdownOption<string>[] = [
        { key: "all", label: "Semua Cabang", value: "" }, // empty string = all
        ...branches.map((b) => ({
            key: b.id,
            label: b.name,
            value: b.id,
            subtitle: b.branch_code ? `(${b.branch_code})` : undefined,
        })),
    ];

    // Fetch staff dengan filter
    const { data, isLoading, isError } = useStaff({
        search: debouncedSearch,
        page,
        per_page: perPage,
        branch_id: selectedBranchId || undefined, // undefined = tampilkan semua
    });

    const deleteMutation = useDeleteStaff();

    // Sync filter ke URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        if (selectedBranchId) params.set("branch_id", selectedBranchId);
        params.set("page", String(page));
        params.set("per_page", String(perPage));

        router.replace(`/owner/staffs?${params.toString()}`);
    }, [debouncedSearch, selectedBranchId, page, perPage, router]);

    // Toast success message
    useEffect(() => {
        const success = searchParams.get("success");
        const updated = searchParams.get("updated");
        const deleted = searchParams.get("deleted");

        if (success === "true" && !hasShownToast.current) {
            toast.success("Staf berhasil dibuat");
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

        if (success || updated || deleted) {
            window.history.replaceState({}, "", "/owner/staffs");
        }
    }, [searchParams]);

    const entries: StaffData[] = data?.data ?? [];
    const totalItems = data?.meta?.total ?? entries.length;

    if (isError) {
        return <div className="py-10 text-center text-red-500">Terjadi kesalahan saat memuat data staf</div>;
    }

    /* =========================
     * ROLE BADGE
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

    /* =========================
     * TABLE COLUMNS
     * ========================= */
    const columns: Column<StaffData>[] = [
        {
            header: "Nama",
            render: (item) => (
                <Link href={`/owner/staffs/${item.id}`} className="font-medium hover:underline">
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
            header: "Role Global",
            render: (item) => (
                <span className={`rounded-lg px-2 py-1 text-sm font-medium ${globalRoleColor[item.role] ?? "bg-zinc-100 text-zinc-600"}`}>
                    {item.role === "staff" ? "Staf" : item.role === "owner" ? "Owner" : item.role}
                </span>
            ),
            width: "w-32",
        },
        {
            header: "Cabang",
            render: (item) => {
                const branches = item.branches ?? [];

                if (branches.length === 0) return <span className="text-zinc-400 text-sm">Belum ditugaskan</span>;

                return (
                    <div className="flex flex-wrap gap-1">
                        {branches.slice(0, 2).map((sb) => (
                            <span key={sb.id} className={`rounded-md px-2 py-0.5 text-xs font-medium ${branchRoleColor[sb.role] ?? "bg-zinc-100 text-zinc-600"}`}>
                                {sb.branch?.name ?? sb.branch_id}
                            </span>
                        ))}
                        {branches.length > 2 && <span className="rounded-md px-2 py-0.5 text-xs bg-zinc-100 text-zinc-500">+{branches.length - 2} lagi</span>}
                    </div>
                );
            },
            width: "w-52",
        },
        {
            header: "Status",
            render: (item) =>
                item.is_active ? <span className="text-green-600 rounded-lg px-2 py-1 bg-green-600/10 font-medium">Aktif</span> : <span className="text-zinc-500 rounded-lg px-2 py-1 bg-zinc-300/10 font-medium">Tidak Aktif</span>,
            width: "w-32",
        },
        {
            header: "Login Terakhir",
            render: (item) => <span className="text-sm text-zinc-500">{item.last_login_at ? new Date(item.last_login_at).toLocaleDateString("id-ID") : "-"}</span>,
            width: "w-36",
        },
    ];

    const actions: ActionItem<StaffData>[] = [
        {
            label: "Lihat Detail",
            icon: "eye",
            onClick: (row) => router.push(`/owner/staffs/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/owner/staffs/${row.id}/edit`),
        },
        {
            label: "Hapus",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            disabled: (row) => currentStaff?.id === row.id,
            onClick: (row) => {
                if (confirm("Apakah Anda yakin ingin menghapus staf ini?")) {
                    deleteMutation.mutate(row.id);
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
                            <li>Manajemen Pengguna</li>
                            <li className="text-aksen-secondary">Staf</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-4 flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Manajemen Staf</h1>
                            <p className="text-zinc-500">Kelola semua staf di seluruh cabang</p>
                        </div>
                        <div className="mb-6 flex items-center justify-between gap-3">
                            <div className="w-60 text-geonet-gray">
                                <SearchInput name="search" placeholder="Cari nama atau email..." />
                            </div>

                            <CustomButton iconName="plus" className="text-white px-4 py-2" onClick={() => router.push("/owner/staffs/create")}>
                                Tambah Staf
                            </CustomButton>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center justify-end mb-6">
                        <div className="w-62">
                            <Controller
                                name="branch_id"
                                control={form.control}
                                render={({ field, fieldState: { error } }) => <SearchableDropdown className="max-h-10" name="branch_id" options={branchOptions} placeholder="Filter berdasarkan Cabang" />}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/owner/staffs/${row.id}`)} />
                        )}
                    </div>

                    {/* Info */}
                    <div className="mt-4 text-sm text-zinc-500">
                        Menampilkan {entries.length} dari {totalItems} staf
                    </div>

                    {/* Pagination */}
                    <div className="mt-4">
                        <PaginationWithRows
                            hasNextPage={data?.meta?.hasNextPage ?? false}
                            hasPrevPage={data?.meta?.hasPrevPage ?? false}
                            totalItems={data?.meta?.total ?? 0}
                            currentPage={page}
                            currentPerPage={perPage}
                            onPageChange={setPage}
                            onRowsPerPageChange={setPerPage}
                            rowOptions={[5, 10, 15, 20, 50]}
                            defaultRowsPerPage={15}
                        />
                    </div>
                </div>
            </div>
        </FormProvider>
    );
}
