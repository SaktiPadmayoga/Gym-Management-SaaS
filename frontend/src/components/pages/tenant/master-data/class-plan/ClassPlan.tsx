"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { ClassPlanData, ClassPlanDataWithKeyword } from "@/types/class-plan";
import { DUMMY_CLASS_PLANS } from "@/lib/dummy/classPlanDummy";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";

export default function ClassPlan() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const form = useForm<ClassPlanDataWithKeyword>({
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
            toast.success("Class plan created successfully");
        }

        if (updated === "true" && !hasShownToast.current) {
            toast.success("Class plan updated successfully");
        }

        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Class plan deleted successfully");
        }

        hasShownToast.current = true;
        window.history.replaceState({}, "", "/class-plan");
    }, [searchParams]);

    /** 📊 Table Columns */
    const columns: Column<ClassPlanData>[] = [
        {
            header: "ID",
            render: (item) => <span className="font-medium">{item.id}</span>,
            width: "w-32",
        },
        {
            header: "Name",
            render: (item) => (
                <Link href={`/class-plan/${item.id}`} className="font-medium hover:underline">
                    {item.name}
                </Link>
            ),
            width: "w-64",
        },
        {
            header: "Access Type",
            render: (item) => <span>{item.accessType}</span>,
            width: "w-48",
        },
        {
            header: "Duration (min)",
            render: (item) => <span>{item.minutesPerSession}</span>,
            width: "w-32",
        },
        {
            header: "Max Visitors",
            render: (item) => <span>{item.maxVisitor}</span>,
            width: "w-32",
        },
        {
            header: "Price",
            render: (item) => <span className="font-medium">Rp {item.price.toLocaleString("id-ID")}</span>,
            width: "w-48",
        },
        {
            header: "Status",
            render: (item) =>
                item.sessionSetting.unlimitedDailySession || item.sessionSetting.unlimitedMonthlySession ? (
                    <span className="text-green-600 rounded-lg p-2 bg-green-600/10 font-medium">Active</span>
                ) : (
                    <span className="text-red-600 rounded-lg p-2 bg-red-600/10">Inactive</span>
                ),
            width: "w-32",
        },
    ];

    /** ⚙️ Row Actions */
    const actions: ActionItem<ClassPlanData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            onClick: (row) => router.push(`/class-plan/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/class-plan/${row.id}`),
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm("Are you sure you want to delete this class plan?")) {
                    toast.success("Class plan deleted");
                }
            },
        },
    ];

    /** 📄 Pagination */
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("per_page")) || 5;

    const start = (page - 1) * perPage;
    const end = start + perPage;

    const entries = DUMMY_CLASS_PLANS.slice(start, end);

    const showingFrom = entries.length === 0 ? 0 : start + 1;
    const showingTo = Math.min(end, DUMMY_CLASS_PLANS.length);
    const totalData = DUMMY_CLASS_PLANS.length;

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
                                <li className="text-aksen-secondary">Class Plan</li>
                            </ul>
                        </div>

                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-zinc-800">Class Plan</h1>
                                <p className="text-zinc-500">Manage class plans available for customers</p>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-64 text-zinc-800">
                                    <SearchInput name="keyword" />
                                </div>
                                <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/class-plan/create")}>
                                    New Plan
                                </CustomButton>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/class-plan/${row.id}`)} />
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
