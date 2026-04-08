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
import { useTenantHeader } from "@/hooks/useTenantHeader";
import Link from "next/link";

type DomainSearchForm = {
    search: string;
};

export default function DomainsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    // ✅ Ambil data tenant aktif (seperti di TenantHeader)
    const { data: tenantData, isLoading: isTenantLoading } = useTenantHeader();

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<DomainSearchForm>({
        defaultValues: {
            search: searchParams.get("search") || "",
        },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    // ✅ Fetch data domain
    // Pastikan hook useDomains di backend sudah memfilter berdasarkan tenant_id dari session/auth
    const { data, isLoading, isError } = useDomains({
        search: debouncedSearch,
        page,
        per_page: perPage,
        tenant_id: tenantData?.id, 
    });

    const deleteMutation = useDeleteDomain();
    const togglePrimaryMutation = useTogglePrimaryDomain();

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));

        router.replace(`/owner/domains?${params.toString()}`);
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

        const toastMessages: Record<string, string> = {
            success: "Domain created successfully",
            updated: "Domain updated successfully",
            deleted: "Domain deleted successfully",
        };

        if ((success || updated || deleted) && !hasShownToast.current) {
            const key = success ? "success" : updated ? "updated" : "deleted";
            toast.success(toastMessages[key]);
            hasShownToast.current = true;
            window.history.replaceState({}, "", "/owner/domains");
        }
    }, [searchParams]);

    if (isError) {
        return <div className="py-10 text-center text-red-500">Error loading domains. Please try again later.</div>;
    }

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            tenant: "text-blue-600 bg-blue-600/10",
            branch: "text-green-600 bg-green-600/10",
            custom: "text-purple-600 bg-purple-600/10",
        };
        return colors[type] ?? "text-gray-600 bg-gray-600/10";
    };

    const columns: Column<DomainData>[] = [
        {
            header: "Domain",
            render: (item) => (
                <div>
                    <div className="font-semibold text-zinc-800">{item.domain}</div>
                    {item.is_primary && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">
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
                <span className={`inline-block rounded-lg px-3 py-1 text-xs font-semibold capitalize ${getTypeColor(item.type)}`}>
                    {item.type}
                </span>
            ),
            width: "w-28",
        },
        {
            header: "Target Entity",
            render: (item) => (
                <div className="text-sm">
                    {item.type === "tenant" ? (
                        <div className="flex flex-col">
                            <span className="text-zinc-700 font-medium">{tenantData?.name}</span>
                            <span className="text-xs text-zinc-400">Main Identity</span>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <span className="text-zinc-700 font-medium">{item.branch?.name || "Global"}</span>
                            {item.branch?.branch_code && (
                                <span className="text-xs text-zinc-400">{item.branch.branch_code}</span>
                            )}
                        </div>
                    )}
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Created At",
            render: (item) => (
                <div className="text-sm text-zinc-600">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString("en-GB", {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    }) : "—"}
                </div>
            ),
            width: "w-32",
        },
    ];

    const actions: ActionItem<DomainData>[] = [
        {
            label: "Edit Domain",
            icon: "edit",
            className: "text-blue-600",
            onClick: (row) => router.push(`/owner/domains/${row.id}/edit`),
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600",
            divider: true,
            onClick: (row) => {
                if (confirm(`Are you sure you want to delete "${row.domain}"?`)) {
                    deleteMutation.mutate(row.id);
                }
            },
        },
    ];

    const entries = data?.data ?? [];
    const totalData = data?.meta?.total ?? 0;

    return (
        <FormProvider {...form}>
            <div className="space-y-4">
                <Toaster position="top-center" />
                
                <div className="rounded-xl font-figtree bg-white border border-zinc-200 px-6 py-5 shadow-sm">
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Tenant & Subscription</li>
                            <li>
                                <Link className="text-aksen-secondary" href="/owner/domains">Domains</Link>
                            </li>
                        </ul>
                    </div>
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-zinc-900">Domains</h1>
                                {tenantData && (
                                    <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded">
                                        ID: {tenantData.slug}
                                    </span>
                                )}
                            </div>
                            <p className="text-zinc-500 text-sm">
                                Managing domains for <span className="font-medium text-zinc-700">{tenantData?.name || "your tenant"}</span>
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="w-full md:w-64">
                                <SearchInput name="search" placeholder="Search domains..." />
                            </div>
                          
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="min-h-[400px]">
                        {(isLoading || isTenantLoading) ? (
                            <div className="space-y-4">
                                {[...Array(perPage)].map((_, i) => (
                                    <div key={i} className="h-14 bg-zinc-50 rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-zinc-100 rounded-xl">
                                <p className="text-zinc-400">No domains found for this tenant.</p>
                                <button 
                                    onClick={() => router.push("/owner/domains/create")}
                                    className="mt-2 text-sm text-blue-600 font-medium hover:underline"
                                >
                                    Add your first domain
                                </button>
                            </div>
                        ) : (
                            <CustomTable
                                columns={columns}
                                data={entries}
                                actions={actions}
                                onRowClick={(row) => router.push(`/owner/domains/${row.id}`)}
                            />
                        )}
                    </div>
                </div>

                {/* Footer / Pagination */}
                {!isLoading && entries.length > 0 && (
                    <div className="">
                        <PaginationWithRows
                            hasNextPage={data?.meta?.current_page! < data?.meta?.last_page!}
                            hasPrevPage={data?.meta?.current_page! > 1}
                            totalItems={totalData}
                            rowOptions={[10, 15, 25, 50]}
                            defaultRowsPerPage={perPage}
                        />
                    </div>
                )}
            </div>
        </FormProvider>
    );
}