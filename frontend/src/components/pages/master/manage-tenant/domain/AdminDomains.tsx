"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { DomainData } from "@/types/central/domains";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useDomains, useDeleteDomain, useTogglePrimaryDomain } from "@/hooks/useDomains";
import { useDebounce } from "@/hooks/useDebounce";

type DomainSearchForm = {
    search: string;
};

// ✅ BASE PATH untuk central
const BASE_PATH = "/admin/domains";

export default function AdminDomainsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<DomainSearchForm>({
        defaultValues: {
            search: searchParams.get("search") || "",
        },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = useDomains({
        search: debouncedSearch,
        page,
        per_page: perPage,
    });

    const deleteMutation = useDeleteDomain();
    const togglePrimaryMutation = useTogglePrimaryDomain();

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));

        // ✅ Ganti ke admin path
        router.replace(`${BASE_PATH}?${params.toString()}`);
    }, [debouncedSearch, page, perPage, router]);

    useEffect(() => {
        const success = searchParams.get("success");
        const updated = searchParams.get("updated");
        const deleted = searchParams.get("deleted");

        if (!success && !updated && !deleted) {
            hasShownToast.current = false;
            return;
        }

        if (success === "true" && !hasShownToast.current) {
            toast.success("Domain created successfully");
            hasShownToast.current = true;
        }
        if (updated === "true" && !hasShownToast.current) {
            toast.success("Domain updated successfully");
            hasShownToast.current = true;
        }
        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Domain deleted successfully");
            hasShownToast.current = true;
        }

        // ✅ Ganti ke admin path
        window.history.replaceState({}, "", BASE_PATH);
    }, [searchParams]);

    const entries: DomainData[] = data?.data ?? [];
    const totalData = data?.meta?.total ?? entries.length;

    if (isError) {
        toast.error("Error loading domains");
        return <div className="py-10 text-center text-red-500">Error loading domains.</div>;
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case "tenant": return "text-blue-600 bg-blue-600/10";
            case "branch": return "text-green-600 bg-green-600/10";
            case "custom": return "text-purple-600 bg-purple-600/10";
            default: return "text-gray-600 bg-gray-600/10";
        }
    };

    const columns: Column<DomainData>[] = [
        {
            header: "Domain",
            render: (item) => (
                <div>
                    <div className="font-semibold text-zinc-800">{item.domain}</div>
                    {item.is_primary && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded mt-1 inline-block">
                            Primary
                        </span>
                    )}
                </div>
            ),
            width: "w-64",
        },
        {
            header: "Type",
            render: (item) => (
                <span className={`inline-block rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${getTypeColor(item.type)}`}>
                    {item.type}
                </span>
            ),
            width: "w-28",
        },
        {
            header: "Tenant",
            render: (item) => (
                <div className="text-sm">
                    <div className="text-zinc-700">{item.tenant?.name || "—"}</div>
                    {item.tenant?.slug && <div className="text-xs text-zinc-500 mt-0.5">{item.tenant.slug}</div>}
                </div>
            ),
            width: "w-40",
        },
        {
            header: "Branch",
            render: (item) => (
                item.branch ? (
                    <div className="text-sm">
                        <div className="text-zinc-700">{item.branch.name || item.branch.branch_code || "—"}</div>
                        {item.branch.branch_code && (
                            <div className="text-xs text-zinc-500 mt-0.5">{item.branch.branch_code}</div>
                        )}
                    </div>
                ) : (
                    <span className="text-zinc-400 text-sm">—</span>
                )
            ),
            width: "w-40",
        },
        {
            header: "Created",
            render: (item) => (
                <div className="text-sm">
                    <div className="text-zinc-700">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                        }) : "—"}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit", minute: "2-digit",
                        }) : ""}
                    </div>
                </div>
            ),
            width: "w-32",
        },
    ];

    const actions: ActionItem<DomainData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            className: "text-zinc-800",
            // ✅ Ganti ke admin path
            onClick: (row) => router.push(`/admin/domains/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/admin/domains/${row.id}/edit`),
        },
        {
            label: "Toggle Primary",
            icon: "archive",
            className: "text-orange-600 hover:bg-orange-50",
            onClick: (row) => togglePrimaryMutation.mutate(row.id),
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm(`Are you sure you want to delete domain "${row.domain}"?`)) {
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

                    {/* ✅ Breadcrumb admin */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Tenant & Subscription</li>
                            <li className="text-aksen-secondary">Domains</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Domains</h1>
                            <p className="text-zinc-500">Manage all tenant domain configurations</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" />
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
                        ) : entries.length === 0 ? (
                            <div className="py-10 text-center text-zinc-500">
                                No domains found.
                            </div>
                        ) : (
                            <CustomTable
                                columns={columns}
                                data={entries}
                                actions={actions}
                                onRowClick={(row) => router.push(`/admin/domains/${row.id}`)}
                            />
                        )}
                    </div>

                    {entries.length > 0 && (
                        <div className="mt-4 text-sm text-zinc-500">
                            Showing {entries.length} of {totalData} domains
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <PaginationWithRows
                        hasNextPage={data?.meta?.current_page ? data.meta.current_page < (data.meta.last_page || 1) : false}
                        hasPrevPage={(data?.meta?.current_page ?? 0) > 1}
                        totalItems={totalData}
                        currentPage={page}                    // ← Penting
                        currentPerPage={perPage}              // ← Penting
                        onPageChange={setPage}                // ← Penting
                        onRowsPerPageChange={setPerPage}      // ← Penting
                        rowOptions={[5, 10, 15, 20, 50]}
                        defaultRowsPerPage={15}
                    />
                </div>
            </div>
        </FormProvider>
    );
}