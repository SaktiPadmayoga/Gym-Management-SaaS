"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { PTSessionPlanData } from "@/types/pt-session-plan";
import { DUMMY_PT_SESSION_PLANS } from "@/lib/dummy/ptSessionPlanDummy";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";

type PTSessionPlanWithKeyword = {
    keyword: string;
};

export default function PTSessionPlan() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const form = useForm<PTSessionPlanWithKeyword>({
        defaultValues: {
            keyword: "",
        },
    });

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
            toast.success("PT session plan created successfully");
        }

        if (updated === "true" && !hasShownToast.current) {
            toast.success("PT session plan updated successfully");
        }

        if (deleted === "true" && !hasShownToast.current) {
            toast.success("PT session plan deleted successfully");
        }

        hasShownToast.current = true;
        window.history.replaceState({}, "", "/pt-sessions-plan");
    }, [searchParams]);

    /** 📊 Table Columns */
    const columns: Column<PTSessionPlanData>[] = [
        {
            header: "ID",
            render: (item) => <span className="font-medium">{item.id}</span>,
            width: "w-40",
        },
        {
            header: "Name",
            render: (item) => (
                <Link href={`/pt-sessions-plan/${item.id}`} className="font-medium hover:underline">
                    {item.name}
                </Link>
            ),
            width: "w-64",
        },
        {
            header: "Category",
            render: (item) => <span>{item.category}</span>,
            width: "w-48",
        },
        {
            header: "Duration",
            render: (item) => (
                <span>
                    {item.duration} {item.durationUnit}
                </span>
            ),
            width: "w-40",
        },
        {
            header: "Price",
            render: (item) => <span className="font-medium">Rp {item.price.toLocaleString("id-ID")}</span>,
            width: "w-48",
        },
        {
            header: "Status",
            render: (item) =>
                item.availabilitySetting.alwaysAvailable ? <span className="text-green-600 rounded-lg p-2 bg-green-600/10 font-medium">Active</span> : <span className="text-red-600 rounded-lg p-2 bg-red-600/10">Inactive</span>,
            width: "w-32",
        },
    ];

    /** ⚙️ Row Actions */
    const actions: ActionItem<PTSessionPlanData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            onClick: (row) => router.push(`/pt-sessions-plan/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/pt-sessions-plan/${row.id}`),
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm("Are you sure you want to delete this PT session plan?")) {
                    toast.success("PT session plan deleted");
                }
            },
        },
    ];

    /** 📄 Pagination */
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("per_page")) || 5;

    const start = (page - 1) * perPage;
    const end = start + perPage;

    const entries = DUMMY_PT_SESSION_PLANS.slice(start, end);

    const showingFrom = entries.length === 0 ? 0 : start + 1;
    const showingTo = Math.min(end, DUMMY_PT_SESSION_PLANS.length);
    const totalData = DUMMY_PT_SESSION_PLANS.length;

    return (
        <FormProvider {...form}>
            <div>
                <form>
                    <div className="rounded-xl font-figtree bg-white border border-gray-500/20 px-6 py-4">
                        <Toaster position="top-center" />

                        {/* Breadcrumb */}
                        <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                            <ul>
                                <li>Master Data</li>
                                <li className="text-aksen-secondary">PT Session Plan</li>
                            </ul>
                        </div>

                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-zinc-800">PT Session Plan</h1>
                                <p className="text-zinc-500">Manage PT session plans available for customers</p>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-64 text-zinc-800">
                                    <SearchInput name="keyword" />
                                </div>
                                <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/pt-sessions-plan/create")}>
                                    New Plan
                                </CustomButton>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/pt-sessions-plan/${row.id}`)} />
                        </div>

                        {/* Info */}
                        <div className="mt-4 text-sm text-zinc-500">
                            Showing {showingFrom} to {showingTo} of {totalData} data
                        </div>
                    </div>
                </form>

                {/* Pagination */}
                <div className="mt-4">
                    <PaginationWithRows hasNextPage={end < totalData} hasPrevPage={start > 0} totalItems={totalData} rowOptions={[5, 10, 20, 50]} defaultRowsPerPage={5} />
                </div>
            </div>
        </FormProvider>
    );
}
