"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { TenantBranchData } from "@/types/central/tenant-branches";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useTenantBranches, useDeleteTenantBranch, useToggleActiveTenantBranch } from "@/hooks/useTenantBranches";
import { useDebounce } from "@/hooks/useDebounce";

type BranchSearchForm = {
    search: string;
};

export default function BranchesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<BranchSearchForm>({
        defaultValues: {
            search: searchParams.get("search") || "",
        },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    // Fetch data
    const { data, isLoading, isError } = useTenantBranches({
        search: debouncedSearch,
        page,
        per_page: perPage,
    });

    const deleteMutation = useDeleteTenantBranch();
    const toggleActiveMutation = useToggleActiveTenantBranch();

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));

        router.replace(`/owner/branches?${params.toString()}`);
    }, [debouncedSearch, page, perPage, router]);

    // Toast handler
    useEffect(() => {
        const success = searchParams.get("success");
        const updated = searchParams.get("updated");
        const deleted = searchParams.get("deleted");

        if (!success && !updated && !deleted) {
            hasShownToast.current = false;
            return;
        }

        if (success === "true" && !hasShownToast.current) {
            toast.success("Branch created successfully");
            hasShownToast.current = true;
        }

        if (updated === "true" && !hasShownToast.current) {
            toast.success("Branch updated successfully");
            hasShownToast.current = true;
        }

        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Branch deleted successfully");
            hasShownToast.current = true;
        }

        window.history.replaceState({}, "", "/owner/branches");
    }, [searchParams]);

    const entries: TenantBranchData[] = data?.data ?? [];
    console.log("entries :", entries);
    const totalData = data?.meta?.total ?? entries.length;

    if (isError) {
        toast.error("Error loading branches");
        return <div className="py-10 text-center text-red-500">Error loading branches</div>;
    }

    const getStatusColor = (isActive: boolean) => {
        return isActive ? "text-green-600 bg-green-600/10" : "text-gray-600 bg-gray-600/10";
    };

    const columns: Column<TenantBranchData>[] = [
        {
            header: "Branch Info",
            render: (item) => (
                <div>
                    <div className="font-semibold text-zinc-800">{item.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Code: {item.branch_code}</div>
                </div>
            ),
            width: "w-56",
        },
        {
            header: "Contact",
            render: (item) => (
                <div className="text-sm">
                    <div className="text-zinc-700">{item.email || "-"}</div>
                    {item.phone && <div className="text-xs text-zinc-500 mt-1">{item.phone}</div>}
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Location",
            render: (item) => (
                <div className="text-sm">
                    <div className="text-zinc-700">{item.city || "-"}</div>
                    {item.address && <div className="text-xs text-zinc-500 mt-1 truncate max-w-[200px]">{item.address}</div>}
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Domain",
            render: (item) => {
                const primaryDomain = item.domains?.find((d) => d.is_primary);
                return (
                    <div className="text-sm">
                        <div className="text-zinc-700 font-medium">{primaryDomain ? primaryDomain.domain : "-"}</div>
                    </div>
                );
            },
            width: "w-48",
        },
        {
            header: "Status",
            render: (item) => (
                <span className={`inline-block rounded-lg px-3 py-1.5 text-sm font-medium ${getStatusColor(item.is_active)}`}>
                    {item.is_active ? "Active" : "Inactive"}
                </span>
            ),
            width: "w-28",
        },
        {
            header: "Opened At",
            render: (item) => (
                <div className="text-sm">
                    <div className="text-zinc-700">
                        {item.opened_at
                            ? new Date(item.opened_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                              })
                            : "-"}
                    </div>
                </div>
            ),
            width: "w-32",
        },
        {
            header: "Created",
            render: (item) => (
                <div className="text-sm">
                    <div className="text-zinc-700">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                        {new Date(item.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                    </div>
                </div>
            ),
            width: "w-32",
        },
    ];

    const actions: ActionItem<TenantBranchData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            className: "text-zinc-800",
            onClick: (row) => router.push(`/owner/branches/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/owner/branches/${row.id}/edit`),
        },
        {
            label: "Toggle Status",
            icon: "plus",
            className: "text-orange-600 hover:bg-orange-50",
            onClick: (row) => {
                toggleActiveMutation.mutate(row.id);
            },
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm(`Are you sure you want to delete branch "${row.name}"?`)) {
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

                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Management</li>
                            <li className="text-aksen-secondary">Branches</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Branches</h1>
                            <p className="text-zinc-500">Manage your gym branches</p>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" />
                            </div>
                            <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/owner/branches/create")}>
                                New Branch
                            </CustomButton>
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
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/owner/branches/${row.id}`)} />
                        )}
                    </div>

                    <div className="mt-4 text-sm text-zinc-500">
                        Showing {entries.length} of {totalData} branches
                    </div>
                </div>

                <div className="mt-4">
                    <PaginationWithRows
                        hasNextPage={data?.meta?.current_page && data?.meta?.last_page ? data?.meta?.current_page < data?.meta?.last_page : false}
                        hasPrevPage={(data?.meta?.current_page ?? 0) > 1}
                        totalItems={totalData}
                        rowOptions={[5, 10, 15, 20, 50]}
                        defaultRowsPerPage={perPage}
                    />
                </div>
            </div>
        </FormProvider>
    );
}
