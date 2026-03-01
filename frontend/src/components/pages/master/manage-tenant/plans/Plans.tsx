"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { PlansData, PlansDataWithKeyword } from "@/types/central/plans";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { usePlans, useDeletePlan } from "@/hooks/usePlans";
import { useDebounce } from "@/hooks/useDebounce";

export default function PlansPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<PlansDataWithKeyword>({
        defaultValues: {
            search: searchParams.get("search") || "",
        },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    // Fetch data
    const { data, isLoading, isError } = usePlans({
        search: debouncedSearch,
        page,
        per_page: perPage,
    });
    console.log("=== PLANS DEBUG ===");
    console.log("debouncedSearch:", debouncedSearch);
    console.log("page:", page);
    console.log("perPage:", perPage);
    console.log("data:", data);
    console.log("isLoading:", isLoading);
    console.log("isError:", isError);

    const deleteMutation = useDeletePlan();

    // Update URL when search changes
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        }
        params.set("page", String(page));
        params.set("per_page", String(perPage));

        router.replace(`/admin/plans?${params.toString()}`);
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
            toast.success("Plan created successfully");
            hasShownToast.current = true;
        }

        if (updated === "true" && !hasShownToast.current) {
            toast.success("Plan updated successfully");
            hasShownToast.current = true;
        }

        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Plan deleted successfully");
            hasShownToast.current = true;
        }

        window.history.replaceState({}, "", "/admin/plans");
    }, [searchParams]);

    const entries: PlansData[] = data ?? [];
    const totalData = entries.length;

    if (isError) {
        toast.error("Error loading plans");
        return <div className="py-10 text-center text-red-500">Error loading plans</div>;
    }

    const columns: Column<PlansData>[] = [
        {
            header: "Code",
            render: (item) => <span className="font-medium">{item.code || "-"}</span>,
            width: "w-40",
        },
        {
            header: "Plan Name",
            render: (item) => (
                <Link href={`/admin/plans/${item.id}`} className="font-medium hover:underline">
                    {item.name}
                </Link>
            ),
            width: "w-40",
        },
        {
            header: "Price / Month",
            render: (item) => (item.pricing.monthly === 0 ? <span className="font-medium text-zinc-500">Custom</span> : <span className="font-medium">Rp {item.pricing.monthly.toLocaleString("id-ID")}</span>),
            width: "w-42",
        },
        {
            header: "Members",
            render: (item) => <span>{item.limits.max_membership === 0 ? "Unlimited" : item.limits.max_membership}</span>,
            width: "w-40",
        },
        {
            header: "Branches",
            render: (item) => <span>{item.limits.max_branches === 0 ? "Unlimited" : item.limits.max_branches}</span>,
            width: "w-40",
        },
        {
            header: "Status",
            render: (item) => (item.is_active ? <span className="text-green-600 rounded-lg p-2 bg-green-600/10 font-medium">Active</span> : <span className="text-red-600 rounded-lg p-2 bg-red-600/10 font-medium">Inactive</span>),
            width: "w-34",
        },
        {
            header: "Visibility",
            render: (item) => (item.is_public ? <span className="text-blue-600 rounded-lg p-2 bg-blue-600/10 font-medium">Public</span> : <span className="text-zinc-600 rounded-lg p-2 bg-zinc-600/10 font-medium">Private</span>),
            width: "w-30",
        },
    ];

    const actions: ActionItem<PlansData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            onClick: (row) => router.push(`/admin/plans/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/admin/plans/${row.id}/edit`),
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm("Are you sure?")) {
                    deleteMutation.mutate(row.id?.toString() || "");
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
                            <li className="text-aksen-secondary">Plans</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Plans</h1>
                            <p className="text-zinc-500">Manage subscription plans</p>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" />
                            </div>
                            <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/admin/plans/create")}>
                                New Plan
                            </CustomButton>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="">
                                <div className="space-y-3">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <CustomTable columns={columns} data={data || []} actions={actions} onRowClick={(row) => router.push(`/admin/plans/${row.id}`)} />
                        )}
                    </div>

                    <div className="mt-4 text-sm text-zinc-500">
                        Showing {entries.length > 0 ? 1 : 0} to {entries.length} of {totalData} data
                    </div>
                </div>
                {/* Pagination */}
                <div className="mt-4">
                    <PaginationWithRows hasNextPage={false} hasPrevPage={false} totalItems={totalData} rowOptions={[5, 10, 20, 50]} defaultRowsPerPage={perPage} />
                </div>
            </div>
        </FormProvider>
    );
}
