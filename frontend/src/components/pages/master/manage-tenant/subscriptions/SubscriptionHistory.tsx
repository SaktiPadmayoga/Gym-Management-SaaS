"use client";

import CustomTable, { Column } from "@/components/ui/table/CustomTable";
import { SubscriptionsData } from "@/types/central/subscriptions";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useDebounce } from "@/hooks/useDebounce";

type SearchForm = { search: string };

const BASE_PATH = "/admin/subscriptions-history";

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case "past_due":
            return <span className="text-orange-600 bg-orange-600/10 rounded-lg px-3 py-1.5 text-sm font-medium">Past Due</span>;
        case "cancelled":
            return <span className="text-red-600 bg-red-600/10 rounded-lg px-3 py-1.5 text-sm font-medium">Cancelled</span>;
        case "expired":
            return <span className="text-zinc-600 bg-zinc-600/10 rounded-lg px-3 py-1.5 text-sm font-medium">Expired</span>;
        default:
            return <span className="text-gray-600 bg-gray-600/10 rounded-lg px-3 py-1.5 text-sm font-medium capitalize">{status}</span>;
    }
}

export default function SubscriptionHistory() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<SearchForm>({
        defaultValues: { search: searchParams.get("search") || "" },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading } = useSubscriptions({
        page,
        per_page: perPage,
        search: debouncedSearch,
        // ✅ Filter hanya status history
        status: ["past_due", "cancelled", "expired"],
    });

    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`${BASE_PATH}?${params.toString()}`);
    }, [debouncedSearch, page, perPage, router]);

    const entries: SubscriptionsData[] = data ?? [];
    const totalData = entries.length;

    const columns: Column<SubscriptionsData>[] = [
        {
            header: "Tenant",
            render: (item) => (
                <div className="text-sm">
                    <div className="font-medium text-zinc-800">{item.tenantName || "—"}</div>
                </div>
            ),
            width: "w-40",
        },
        {
            header: "Plan",
            render: (item) => (
                <div className="text-sm">
                    <div className="font-medium text-zinc-800">{item.planName || "—"}</div>
                    <div className="text-xs text-zinc-400 capitalize mt-0.5">{item.billingCycle}</div>
                </div>
            ),
            width: "w-36",
        },
        {
            header: "Amount",
            render: (item) => (
                <span className="text-sm font-medium text-zinc-800">
                    {item.amount === 0
                        ? "Custom"
                        : `Rp ${item.amount.toLocaleString("id-ID")}`}
                </span>
            ),
            width: "w-36",
        },
        {
            header: "Status",
            render: (item) => <StatusBadge status={item.status} />,
            width: "w-28",
        },
        {
            header: "Started",
            render: (item) => (
                <div className="text-sm text-zinc-600">
                    {item.startedAt
                        ? new Date(item.startedAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                          })
                        : "—"}
                </div>
            ),
            width: "w-32",
        },
        {
            header: "Period Ended",
            render: (item) => (
                <div className="text-sm text-zinc-600">
                    {item.currentPeriodEndsAt
                        ? new Date(item.currentPeriodEndsAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                          })
                        : "—"}
                </div>
            ),
            width: "w-32",
        },
        {
            header: "Cancelled At",
            render: (item) => (
                <div className="text-sm text-zinc-500">
                    {item.canceledAt
                        ? new Date(item.canceledAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                          })
                        : "—"}
                </div>
            ),
            width: "w-32",
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
                            <li>Tenant & Subscription</li>
                            <li
                                className="cursor-pointer hover:text-zinc-600"
                                onClick={() => router.push("/admin/subscriptions")}
                            >
                                Subscriptions
                            </li>
                            <li className="text-aksen-secondary">History</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Subscription History</h1>
                            <p className="text-zinc-500">Past due, cancelled, and expired subscriptions</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" />
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                            { label: "Past Due", status: "past_due", color: "text-orange-600 bg-orange-50 border-orange-100" },
                            { label: "Cancelled", status: "cancelled", color: "text-red-600 bg-red-50 border-red-100" },
                            { label: "Expired", status: "expired", color: "text-zinc-600 bg-zinc-50 border-zinc-100" },
                        ].map((item) => {
                            const count = entries.filter((e) => e.status === item.status).length;
                            return (
                                <div key={item.status} className={`rounded-xl border px-4 py-3 ${item.color}`}>
                                    <div className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">
                                        {item.label}
                                    </div>
                                    <div className="text-2xl font-bold">{count}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="py-12 text-center text-zinc-400">
                                No subscription history found.
                            </div>
                        ) : (
                            <CustomTable
                                columns={columns}
                                data={entries}
                                actions={[
                                    {
                                        label: "View Detail",
                                        icon: "eye",
                                        className: "text-zinc-800",
                                        onClick: (row) => router.push(`/admin/subscriptions/${row.id}`),
                                    },
                                ]}
                                onRowClick={(row) => router.push(`/admin/subscriptions/${row.id}`)}
                            />
                        )}
                    </div>

                    {entries.length > 0 && (
                        <div className="mt-4 text-sm text-zinc-500">
                            Showing {entries.length} of {totalData} records
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <div className="mt-4">
                                        <PaginationWithRows hasNextPage={data?.length === perPage} hasPrevPage={page > 1} totalItems={totalData} rowOptions={[5, 10, 20, 50]} defaultRowsPerPage={perPage} />
                                    </div>
                </div>
            </div>
        </FormProvider>
    );
}