"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { SubscriptionsData, SubscriptionsDataWithKeyword } from "@/types/central/subscriptions";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";

import { useSubscriptions, useCancelSubscription } from "@/hooks/useSubscriptions";

export default function Subscriptions() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("per_page")) || 5;
    const keyword = searchParams.get("keyword") || "";

    const form = useForm<SubscriptionsDataWithKeyword>({
        defaultValues: {
            keyword: keyword,
        },
    });

    /** 🔗 Fetch data */
    const { data = [], isLoading } = useSubscriptions({
        page,
        per_page: perPage,
        search: keyword,
    });

    const cancelMutation = useCancelSubscription();

    /** 🔔 Toast handler */
    useEffect(() => {
        const success = searchParams.get("success");
        const updated = searchParams.get("updated");
        const deleted = searchParams.get("deleted");

        if (!success && !updated && !deleted) {
            hasShownToast.current = false;
            return;
        }

        if (success === "true" && !hasShownToast.current) {
            toast.success("Subscription created successfully");
        }

        if (updated === "true" && !hasShownToast.current) {
            toast.success("Subscription updated successfully");
        }

        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Subscription cancelled successfully");
        }

        hasShownToast.current = true;
        window.history.replaceState({}, "", "/subscriptions");
    }, [searchParams]);

    /** 📊 Table Columns */
    const columns: Column<SubscriptionsData>[] = [
        {
            header: "Subscription ID",
            render: (item) => (
                <Link href={`/subscriptions/${item.id}`} className="font-medium hover:underline">
                    {item.id}
                </Link>
            ),
            width: "w-48",
        },
        {
            header: "Tenant",
            render: (item) => <span>{item?.tenantName}</span>,
            width: "w-48",
        },
        {
            header: "Plan",
            render: (item) => <span>{item.planName}</span>,
            width: "w-48",
        },
        {
            header: "Billing",
            render: (item) => <span className="capitalize">{item.billingCycle}</span>,
            width: "w-32",
        },
        {
            header: "Amount",
            render: (item) => (item.amount === 0 ? <span className="text-zinc-500 font-medium">Custom</span> : <span className="font-medium">Rp {item.amount.toLocaleString("id-ID")}</span>),
            width: "w-48",
        },
        {
            header: "Status",
            render: (item) => {
                switch (item.status) {
                    case "active":
                        return <span className="text-green-600 bg-green-600/10 rounded-lg px-3 py-1 font-medium">Active</span>;
                    case "trial":
                        return <span className="text-blue-600 bg-blue-600/10 rounded-lg px-3 py-1 font-medium">Trial</span>;
                    case "past_due":
                        return <span className="text-orange-600 bg-orange-600/10 rounded-lg px-3 py-1 font-medium">Past Due</span>;
                    case "expired":
                        return <span className="text-zinc-600 bg-zinc-600/10 rounded-lg px-3 py-1 font-medium">Expired</span>;
                    default:
                        return <span className="text-red-600 bg-red-600/10 rounded-lg px-3 py-1 font-medium">Cancelled</span>;
                }
            },
            width: "w-32",
        },
        {
            header: "Auto Renew",
            render: (item) => (item.autoRenew ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-zinc-500">No</span>),
            width: "w-32",
        },
        {
            header: "Period Ends",
            render: (item) => (item.currentPeriodEndsAt ? new Date(item.currentPeriodEndsAt).toLocaleDateString("id-ID") : "-"),
            width: "w-48",
        },
    ];

    /** ⚙️ Row Actions */
    const actions: ActionItem<SubscriptionsData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            onClick: (row) => router.push(`/subscriptions/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/subscriptions/${row.id}/edit`),
        },
        {
            label: "Cancel",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (row.status === "cancelled" || row.status === "expired") {
                    toast.error("Subscription already cancelled or expired");
                    return;
                }

                if (!confirm("Are you sure you want to cancel this subscription?")) return;

                cancelMutation.mutate(row.id, {
                    onSuccess: () => {
                        toast.success("Subscription cancelled successfully");
                    },
                    onError: () => {
                        toast.error("Failed to cancel subscription");
                    },
                });
            },
        },
    ];

    const totalData = data.length;
    const showingFrom = totalData === 0 ? 0 : (page - 1) * perPage + 1;
    const showingTo = Math.min(page * perPage, totalData);

    return (
        <FormProvider {...form}>
            <div>
                <form>
                    <div className="rounded-xl font-figtree bg-white border border-gray-500/20 px-6 py-4">
                        <Toaster position="top-center" />

                        {/* Breadcrumb */}
                        <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                            <ul>
                                <li>Tenant & Subscription</li>
                                <li className="text-aksen-secondary">Subscriptions</li>
                            </ul>
                        </div>

                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-zinc-800">Subscriptions</h1>
                                <p className="text-zinc-500">Manage tenant subscriptions and billing cycles</p>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-64 text-zinc-800">
                                    <SearchInput name="keyword" />
                                </div>
                                <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/subscriptions/create")}>
                                    New Subscription
                                </CustomButton>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <CustomTable columns={columns} data={data} actions={actions} onRowClick={(row) => router.push(`/subscriptions/${row.id}`)} />
                        </div>

                        {/* Info */}
                        <div className="mt-4 text-sm text-zinc-500">
                            Showing {showingFrom} to {showingTo} of {totalData} data
                        </div>
                    </div>
                </form>

                {/* Pagination */}
                <div className="mt-4">
                    <PaginationWithRows hasNextPage={data.length === perPage} hasPrevPage={page > 1} totalItems={totalData} rowOptions={[5, 10, 20, 50]} defaultRowsPerPage={perPage} />
                </div>
            </div>
        </FormProvider>
    );
}
