"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { FacilityData, FacilityDataWithKeyword } from "@/types/tenant/facilities";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useFacilities, useDeleteFacility, useToggleFacility } from "@/hooks/tenant/useFacilities";
import { useDebounce } from "@/hooks/useDebounce";

export default function Facilities() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<FacilityDataWithKeyword>({
        defaultValues: { search: searchParams.get("search") || "" },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = useFacilities({
        search: debouncedSearch,
        page,
        per_page: perPage,
    });

    const deleteMutation = useDeleteFacility();
    const toggleMutation = useToggleFacility();

    // Sync URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/facilities?${params.toString()}`);
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
            toast.success("Facility created successfully");
            hasShownToast.current = true;
        }
        if (updated === "true" && !hasShownToast.current) {
            toast.success("Facility updated successfully");
            hasShownToast.current = true;
        }
        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Facility deleted successfully");
            hasShownToast.current = true;
        }

        window.history.replaceState({}, "", "/facility");
    }, [searchParams]);

    const entries: FacilityData[] = data ?? [];
    const totalData = entries.length;

    if (isError) {
        toast.error("Error loading facilities");
        return <div className="py-10 text-center text-red-500">Error loading facilities</div>;
    }

    /* =========================
     * TABLE COLUMNS
     * ========================= */
    const columns: Column<FacilityData>[] = [
        {
            header: "Name",
            render: (item) => (
                <div className="flex items-center gap-2">
                    {item.color && <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />}
                    <Link href={`/facilities/${item.id}`} className="font-medium hover:underline">
                        {item.name}
                    </Link>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Category",
            render: (item) => <span className="text-sm text-zinc-500">{item.category ?? "-"}</span>,
            width: "w-32",
        },
        {
            header: "Access Type",
            render: (item) => <span className={`rounded-lg px-2 py-1 text-xs font-medium capitalize ${item.access_type === "public" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{item.access_type}</span>,
            width: "w-28",
        },
        {
            header: "Price",
            render: (item) => <span className="font-medium text-zinc-800">{Number(item.price) === 0 ? <span className="text-green-600">Free</span> : `Rp ${Number(item.price).toLocaleString("id-ID")}`}</span>,
            width: "w-36",
        },
        {
            header: "Session",
            render: (item) => (
                <div className="text-sm text-zinc-700">
                    <p>{item.minutes_per_session} min</p>
                    <p className="text-xs text-zinc-400">{item.capacity} pax max</p>
                </div>
            ),
            width: "w-28",
        },
        {
            header: "Operational Hours",
            render: (item) => {
                if (!item.operational_hours) {
                    return <span className="text-xs text-zinc-400">Not set</span>;
                }
                const days = Object.entries(item.operational_hours).filter(([, v]) => v.is_open).length;
                return <span className="text-sm text-zinc-600">{days} days / week</span>;
            },
            width: "w-36",
        },
        {
            header: "Status",
            render: (item) =>
                item.is_active ? (
                    <span className="text-green-600 rounded-lg px-2 py-1 bg-green-600/10 font-medium text-sm">Active</span>
                ) : (
                    <span className="text-zinc-500 rounded-lg px-2 py-1 bg-zinc-300/10 font-medium text-sm">Inactive</span>
                ),
            width: "w-24",
        },
    ];

    /* =========================
     * ROW ACTIONS
     * ========================= */
    const actions: ActionItem<FacilityData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            onClick: (row) => router.push(`/facilities/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/facilities/${row.id}`),
        },
        {
            label: (row) => (row.is_active ? "Deactivate" : "Activate"),
            icon: "eye",
            onClick: (row) => {
                toggleMutation.mutate(row.id, {
                    onSuccess: () => toast.success(`Facility ${row.is_active ? "deactivated" : "activated"}`),
                    onError: () => toast.error("Failed to update status"),
                });
            },
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm("Are you sure you want to delete this facility?")) {
                    deleteMutation.mutate(row.id, {
                        onSuccess: () => toast.success("Facility deleted"),
                        onError: () => toast.error("Failed to delete facility"),
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
                            <li className="text-aksen-secondary">Facilities</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Facilities</h1>
                            <p className="text-zinc-500">Manage facilities available for booking</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" />
                            </div>
                            <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/facilities/create")}>
                                New Facility
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
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/facilities/${row.id}`)} />
                        )}
                    </div>

                    <div className="mt-4 text-sm text-zinc-500">
                        Showing {entries.length > 0 ? 1 : 0} to {entries.length} of {totalData} data
                    </div>
                </div>

                <div className="mt-4">
                    <PaginationWithRows hasNextPage={false} hasPrevPage={false} totalItems={totalData} rowOptions={[5, 10, 20, 50]} defaultRowsPerPage={perPage} />
                </div>
            </div>
        </FormProvider>
    );
}
