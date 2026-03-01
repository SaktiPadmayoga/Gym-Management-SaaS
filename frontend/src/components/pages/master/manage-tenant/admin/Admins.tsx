"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { AdminData, AdminDataWithKeyword } from "@/types/central/admins";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useAdmins, useDeleteAdmin } from "@/hooks/useAdmins";
import { useDebounce } from "@/hooks/useDebounce";

export default function Admins() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<AdminDataWithKeyword>({
        defaultValues: {
            search: searchParams.get("search") || "",
        },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    // Fetch data
    const { data, isLoading, isError } = useAdmins({
        search: debouncedSearch,
        page,
        per_page: perPage,
    });

    const deleteMutation = useDeleteAdmin();

    // Update URL params
    useEffect(() => {
        const params = new URLSearchParams();

        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));

        router.replace(`/admin/admins?${params.toString()}`);
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
            toast.success("Admin created successfully");
            hasShownToast.current = true;
        }

        if (updated === "true" && !hasShownToast.current) {
            toast.success("Admin updated successfully");
            hasShownToast.current = true;
        }

        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Admin deleted successfully");
            hasShownToast.current = true;
        }

        window.history.replaceState({}, "", "/admin/admins");
    }, [searchParams]);

    const entries = data ?? [];
    const totalData = entries.length;

    if (isError) {
        toast.error("Error loading admins");
        return <div className="py-10 text-center text-red-500">Error loading admins</div>;
    }

    const columns: Column<AdminData>[] = [
        {
            header: "ID",
            render: (item) => <span className="font-medium">{item.id}</span>,
            width: "w-40",
        },
        {
            header: "Name",
            render: (item) => (
                <Link
                    href={`/admin/admins/${item.id}`}
                    className="font-medium hover:underline"
                >
                    {item.name}
                </Link>
            ),
            width: "w-48",
        },
        {
            header: "Email",
            render: (item) => <span>{item.email}</span>,
            width: "w-56",
        },
        {
            header: "Role",
            render: (item) => (
                <span className="rounded-lg px-2 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium">
                    {item.role}
                </span>
            ),
            width: "w-42",
        },
        {
            header: "Status",
            render: (item) =>
                item.is_active === true ? (
                    <span className="text-green-600 rounded-lg p-2 bg-green-600/10 font-medium">
                        Active
                    </span>
                ) : (
                    <span className="text-zinc-800 rounded-lg p-2 bg-zinc-300/10 font-medium">
                        Inactive
                    </span>
                ),
            width: "w-40",
        },
        {
            header: "Created At",
            render: (item) => (
                <span className="text-sm text-zinc-500">
                    {item.created_at
                        ? new Date(item.created_at).toLocaleDateString()
                        : "-"}
                </span>
            ),
            width: "w-38",
        },
    ];

    const actions: ActionItem<AdminData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            onClick: (row) => router.push(`/admin/admins/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/admin/admins/${row.id}/edit`),
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm("Are you sure?")) {
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
                            <li>System Management</li>
                            <li className="text-aksen-secondary">Admins</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">
                                Admins
                            </h1>
                            <p className="text-zinc-500">
                                Manage SaaS administrator accounts
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" />
                            </div>
                            <CustomButton
                                iconName="plus"
                                className="text-white px-3"
                                onClick={() =>
                                    router.push("/admin/admins/create")
                                }
                            >
                                New Admin
                            </CustomButton>
                        </div>
                    </div>

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
                            <CustomTable
                                columns={columns}
                                data={entries}
                                actions={actions}
                                onRowClick={(row) =>
                                    router.push(`/admin/admins/${row.id}`)
                                }
                            />
                        )}
                    </div>

                    <div className="mt-4 text-sm text-zinc-500">
                        Showing {entries.length > 0 ? 1 : 0} to{" "}
                        {entries.length} of {totalData} data
                    </div>
                </div>

                {/* Pagination */}
                <div className="mt-4">
                    <PaginationWithRows
                        hasNextPage={false}
                        hasPrevPage={false}
                        totalItems={totalData}
                        rowOptions={[5, 10, 20, 50]}
                        defaultRowsPerPage={perPage}
                    />
                </div>
            </div>
        </FormProvider>
    );
}