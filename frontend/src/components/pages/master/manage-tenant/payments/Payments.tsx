"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { PaymentData } from "@/types/central/payments";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { usePayments } from "@/hooks/usePayments";
import { useDebounce } from "@/hooks/useDebounce";

type SearchForm = { search: string };

const BASE_PATH = "/admin/payments";

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        success: "text-green-600 bg-green-600/10",
        pending: "text-yellow-600 bg-yellow-600/10",
        failed:  "text-red-600 bg-red-600/10",
        expired: "text-zinc-600 bg-zinc-600/10",
        refund:  "text-purple-600 bg-purple-600/10",
    };
    return (
        <span className={`inline-block rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${map[status] ?? "text-gray-600 bg-gray-600/10"}`}>
            {status}
        </span>
    );
}

function PaymentTypeBadge({ type }: { type?: string | null }) {
    if (!type) return <span className="text-zinc-400 text-sm">—</span>;
    const map: Record<string, string> = {
        credit_card:   "text-blue-600 bg-blue-50 border-blue-200",
        bank_transfer: "text-indigo-600 bg-indigo-50 border-indigo-200",
        gopay:         "text-green-600 bg-green-50 border-green-200",
        qris:          "text-orange-600 bg-orange-50 border-orange-200",
    };
    return (
        <span className={`inline-block text-xs px-2 py-1 rounded-md border font-medium capitalize ${map[type] ?? "text-gray-600 bg-gray-50 border-gray-200"}`}>
            {type.replace("_", " ")}
        </span>
    );
}

export default function Payments() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ✅ Baca langsung dari searchParams — tidak pakai useState
    const page    = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("per_page")) || 15;

    const form = useForm<SearchForm>({
        defaultValues: { search: searchParams.get("search") || "" },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    // ✅ Sync search ke URL — page reset ke 1 saat search berubah
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) {
            params.set("search", debouncedSearch);
        } else {
            params.delete("search");
        }
        params.set("page", "1");
        params.set("per_page", String(perPage));
        router.replace(`${BASE_PATH}?${params.toString()}`);
    }, [debouncedSearch]);

    const { data, isLoading, isError } = usePayments({
        page,
        per_page: perPage,
        search: debouncedSearch,
    });

    const entries: PaymentData[] = data?.data ?? [];
    const totalData = data?.meta?.total ?? entries.length;

    const columns: Column<PaymentData>[] = [
        {
            header: "Invoice",
            render: (item) => (
                <div>
                    <div className="font-semibold text-zinc-800 text-sm">{item.invoice_number}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{item.order_id}</div>
                </div>
            ),
            width: "w-48",
        },
        {
            header: "Tenant",
            render: (item) => (
                <div className="text-sm">
                    <div className="text-zinc-700 font-medium">{item.tenant_name}</div>
                    <div className="text-xs text-zinc-400">{item.tenant_slug}</div>
                </div>
            ),
            width: "w-40",
        },
        {
            header: "Amount",
            render: (item) => (
                <div className="text-sm font-semibold text-zinc-800">
                    {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: item.currency ?? "IDR",
                        maximumFractionDigits: 0,
                    }).format(item.gross_amount)}
                </div>
            ),
            width: "w-36",
        },
        {
            header: "Method",
            render: (item) => <PaymentTypeBadge type={item.payment_type} />,
            width: "w-36",
        },
        {
            header: "Status",
            render: (item) => <StatusBadge status={item.status} />,
            width: "w-28",
        },
        {
            header: "Paid At",
            render: (item) => (
                <div className="text-sm">
                    <div className="text-zinc-700">
                        {item.paid_at
                            ? new Date(item.paid_at).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric", year: "numeric",
                              })
                            : "—"}
                    </div>
                    {item.paid_at && (
                        <div className="text-xs text-zinc-400 mt-0.5">
                            {new Date(item.paid_at).toLocaleTimeString("en-US", {
                                hour: "2-digit", minute: "2-digit",
                            })}
                        </div>
                    )}
                </div>
            ),
            width: "w-32",
        },
        {
            header: "Created",
            render: (item) => (
                <div className="text-sm text-zinc-500">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                    })}
                </div>
            ),
            width: "w-32",
        },
    ];

    const actions: ActionItem<PaymentData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            className: "text-zinc-800",
            onClick: (row) => router.push(`/admin/payments/${row.id}`),
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
                            <li className="text-aksen-secondary">Payments</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Payments</h1>
                            <p className="text-zinc-500">All tenant payment transactions</p>
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
                                    <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="py-10 text-center text-red-500">
                                Error loading payments.
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="py-10 text-center text-zinc-400">
                                No payments found.
                            </div>
                        ) : (
                            <CustomTable
                                columns={columns}
                                data={entries}
                                actions={actions}
                                onRowClick={(row) => router.push(`/admin/payments/${row.id}`)}
                            />
                        )}
                    </div>

                    {entries.length > 0 && (
                        <div className="mt-4 text-sm text-zinc-500">
                            Showing {entries.length} of {totalData} payments
                        </div>
                    )}
                </div>

                <div className="mt-4">
                    <PaginationWithRows
                        hasNextPage={data?.meta?.current_page && data?.meta?.last_page
                            ? data.meta.current_page < data.meta.last_page
                            : false}
                        hasPrevPage={(data?.meta?.current_page ?? 0) > 1}
                        totalItems={totalData}
                        rowOptions={[5, 10, 15, 20, 50]}
                        defaultRowsPerPage={15}
                    />
                </div>
            </div>
        </FormProvider>
    );
}