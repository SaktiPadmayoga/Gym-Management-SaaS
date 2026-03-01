"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { TenantsData, TenantsDataWithKeyword } from "@/types/central/tenants";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useTenants, useDeleteTenant } from "@/hooks/useTenants";
import { useDebounce } from "@/hooks/useDebounce";

export default function TenantsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<TenantsDataWithKeyword>({
        defaultValues: {
            search: searchParams.get("search") || "",
        },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    // Fetch data
    const { data, isLoading, isError } = useTenants({
        search: debouncedSearch,
        page,
        per_page: perPage,
    });

    const deleteMutation = useDeleteTenant();

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));

        router.replace(`/admin/tenants?${params.toString()}`);
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
            toast.success("Tenant created successfully");
            hasShownToast.current = true;
        }

        if (updated === "true" && !hasShownToast.current) {
            toast.success("Tenant updated successfully");
            hasShownToast.current = true;
        }

        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Tenant deleted successfully");
            hasShownToast.current = true;
        }

        window.history.replaceState({}, "", "/admin/tenants");
    }, [searchParams]);

    const entries: TenantsData[] = data?.data ?? [];
    const totalData = data?.meta?.total ?? entries.length;

    console.log("data:", data);
    console.log("entries:", data?.data);

    if (isError) {
        toast.error("Error loading tenants");
        return <div className="py-10 text-center text-red-500">Error loading tenants</div>;
    }

    const getStatusColor = (status: string) => {
        const colors = {
            trial: "text-blue-600 bg-blue-600/10",
            active: "text-green-600 bg-green-600/10",
            inactive: "text-gray-600 bg-gray-600/10",
            suspended: "text-orange-600 bg-orange-600/10",
            expired: "text-red-600 bg-red-600/10",
        };
        return colors[status as keyof typeof colors] || "text-gray-600 bg-gray-600/10";
    };

    const getSubscriptionStatusColor = (status: string) => {
        const colors = {
            active: "text-green-700 bg-green-50 border-green-200",
            trial: "text-blue-700 bg-blue-50 border-blue-200",
            expired: "text-red-700 bg-red-50 border-red-200",
            cancelled: "text-gray-700 bg-gray-50 border-gray-200",
            suspended: "text-orange-700 bg-orange-50 border-orange-200",
        };
        return colors[status as keyof typeof colors] || "text-gray-700 bg-gray-50 border-gray-200";
    };

    const calculateDaysRemaining = (endDate: string | null) => {
        if (!endDate) return null;
        const end = new Date(endDate);
        const today = new Date();
        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const columns: Column<TenantsData>[] = [
        {
            header: "Tenant Info",
            render: (item) => (
                <div>
                    <div className="font-semibold text-zinc-800">{item.name}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Slug: {item.slug}</div>
                    <div className="text-xs text-zinc-500">Owner: {item.owner_name}</div>
                </div>
            ),
            width: "w-64",
        },
        {
            header: "Contact",
            render: (item) => (
                <div className="text-sm">
                    <div className="text-zinc-700">{item.owner_email}</div>
                    {item.owner_email && <div className="text-xs text-zinc-500 mt-1">{item.owner_email}</div>}
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Domain & Branches",
            render: (item) => {
                const tenantDomain = item.domains?.find((d) => d.type === "tenant");
                const branchCount = item.current_branch_count || 0;

                return (
                    <div className="text-sm">
                        <div className="text-zinc-700 font-medium">{tenantDomain ? tenantDomain.domain : "-"}</div>
                        <div className="text-xs text-zinc-500 mt-1">
                            {branchCount} {branchCount === 1 ? "Branch" : "Branches"}
                            {item.max_branches && ` (Max: ${item.max_branches})`}
                        </div>
                    </div>
                );
            },
            width: "w-56",
        },
        {
            header: "Subscription Plan",
            render: (item) => {
                const subscription = item.latestSubscription;
                const planName = subscription?.plan?.name || "No Plan";

                return (
                    <div className="space-y-1">
                        <div className="text-sm font-medium text-zinc-800">{planName}</div>
                    </div>
                );
            },
            width: "w-40",
        },
        {
            header: "Status",
            render: (item) => {
                const subscription = item.latestSubscription;
                const status = subscription?.status || "-";

                return <span className={`inline-block rounded-lg px-3 py-1.5 text-sm font-medium ${getStatusColor(status || "inactive")}`}>{status ? status.charAt(0).toUpperCase() + status.slice(1) : "Inactive"}</span>;
            },
            width: "w-32",
        },
        {
            header: "Trial Period",
            render: (item) => {
                const daysRemaining = calculateDaysRemaining(item?.trial_ends_at || null);
                const endDate = item.trial_ends_at
                    ? new Date(item.trial_ends_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                      })
                    : "-";

                return (
                    <div className="text-sm">
                        <div className="text-zinc-700">{endDate}</div>
                        {daysRemaining !== null && (
                            <div className={`text-xs mt-1 ${daysRemaining < 0 ? "text-red-600 font-medium" : daysRemaining <= 7 ? "text-orange-600 font-medium" : "text-zinc-500"}`}>
                                {daysRemaining < 0 ? `Expired ${Math.abs(daysRemaining)}d ago` : daysRemaining === 0 ? "Expires today" : `${daysRemaining}d remaining`}
                            </div>
                        )}
                    </div>
                );
            },
            width: "w-36",
        },
        {
            header: "Subscription Until",
            render: (item) => {
                const daysRemaining = calculateDaysRemaining(item?.subscription_ends_at || null);
                const endDate = item.subscription_ends_at
                    ? new Date(item.subscription_ends_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                      })
                    : "-";

                return (
                    <div className="text-sm">
                        <div className="text-zinc-700">{endDate}</div>
                        {daysRemaining !== null && (
                            <div className={`text-xs mt-1 ${daysRemaining < 0 ? "text-red-600 font-medium" : daysRemaining <= 30 ? "text-orange-600 font-medium" : "text-green-600"}`}>
                                {daysRemaining < 0 ? `Expired ${Math.abs(daysRemaining)}d ago` : daysRemaining === 0 ? "Expires today" : `${daysRemaining}d left`}
                            </div>
                        )}
                    </div>
                );
            },
            width: "w-36",
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

    const actions: ActionItem<TenantsData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            className: "text-zinc-800",
            onClick: (row) => router.push(`/admin/tenants/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/admin/tenants/${row.id}/edit`),
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm(`Are you sure you want to delete tenant "${row.name}"?`)) {
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
                            <li>Tenant & Subscription</li>
                            <li className="text-aksen-secondary">Tenants</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Tenants</h1>
                            <p className="text-zinc-500">Manage gym tenants and subscriptions</p>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" />
                            </div>
                            <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/admin/tenants/create")}>
                                New Tenant
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
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/admin/tenants/${row.id}`)} />
                        )}
                    </div>

                    

                    <div className="mt-4 text-sm text-zinc-500">
                        Showing {entries.length} of {totalData} tenants
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
