"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { PtSessionData, PtSessionDataWithKeyword } from "@/types/pt-session";
import { DUMMY_PT_SESSIONS, DUMMY_PERSONAL_TRAINERS } from "@/lib/dummy/ptSessionDummy";

import { DUMMY_PT_SESSION_PLANS } from "@/lib/dummy/ptSessionPlanDummy";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
// import { ProfileData } from "@/lib/dummy/profileDummy";

/* =======================
   HELPER RESOLVER
======================= */
// const getMemberName = (profileId?: string) => {
//     return ProfileData.find((p) => p.id === profileId)?.name ?? "-";
// };

const getPtName = (id?: string) => DUMMY_PERSONAL_TRAINERS.find((p) => p.id === id)?.name ?? "-";

const getPlanName = (id?: string) => DUMMY_PT_SESSION_PLANS.find((p) => p.id === id)?.name ?? "-";

export default function PtSession() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const form = useForm<PtSessionDataWithKeyword>({
        defaultValues: {
            keyword: "",
        },
    });

    /* =======================
       TOAST HANDLER
    ======================= */
    useEffect(() => {
        const success = searchParams.get("success");
        const updated = searchParams.get("updated");
        const deleted = searchParams.get("deleted");

        if (!success && !updated && !deleted) {
            hasShownToast.current = false;
            return;
        }

        if (success === "true" && !hasShownToast.current) {
            toast.success("PT Session created successfully");
        }

        if (updated === "true" && !hasShownToast.current) {
            toast.success("PT Session updated successfully");
        }

        if (deleted === "true" && !hasShownToast.current) {
            toast.success("PT Session deleted successfully");
        }

        hasShownToast.current = true;
        window.history.replaceState({}, "", "/pt-sessions");
    }, [searchParams]);

    /* =======================
       TABLE COLUMNS
    ======================= */
    const columns: Column<PtSessionData>[] = [
        {
            header: "ID",
            render: (item) => <span className="font-medium">{item.id}</span>,
            width: "w-32",
        },
        {
            header: "Member",
            render: (item) => (
                // <Link href={`/pt-sessions/${item.id}`} className="font-medium hover:underline">
                //     {getMemberName(item.memberProfileId)}
                // </Link>
                <span className="font-medium">{item.id}</span>
            ),
            width: "w-56",
        },
        {
            header: "PT",
            render: (item) => <span className="font-medium">{getPtName(item.ptId)}</span>,
            width: "w-48",
        },
        {
            header: "Plan",
            render: (item) => <span className="font-medium">{getPlanName(item.ptSessionPlanId)}</span>,
            width: "w-56",
        },
        {
            header: "Join Date",
            render: (item) => <span>{item.joinDate}</span>,
            width: "w-40",
        },
        {
            header: "Status",
            render: (item) => <span className={`rounded-lg px-3 py-1 font-medium ${item.ptSessionStatus === "Active" ? "text-green-600 bg-green-600/10" : "text-zinc-600 bg-zinc-600/10"}`}>{item.ptSessionStatus}</span>,
            width: "w-32",
        },
    ];

    /* =======================
       ROW ACTIONS
    ======================= */
    const actions: ActionItem<PtSessionData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            onClick: (row) => router.push(`/pt-sessions/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/pt-sessions/${row.id}`),
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: () => {
                if (confirm("Are you sure you want to delete this PT Session?")) {
                    toast.success("PT Session deleted");
                }
            },
        },
    ];

    /* =======================
       PAGINATION
    ======================= */
    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("per_page")) || 5;

    const start = (page - 1) * perPage;
    const end = start + perPage;

    const entries = DUMMY_PT_SESSIONS.slice(start, end);

    const showingFrom = entries.length === 0 ? 0 : start + 1;
    const showingTo = Math.min(end, DUMMY_PT_SESSIONS.length);
    const totalData = DUMMY_PT_SESSIONS.length;

    return (
        <FormProvider {...form}>
            <div>
                <form>
                    <div className="rounded-xl font-figtree bg-white border border-gray-500/20 px-6 py-4">
                        <Toaster position="top-center" />

                        {/* Breadcrumb */}
                        <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                            <ul>
                                <li>Transaction</li>
                                <li className="text-aksen-secondary">PT Session</li>
                            </ul>
                        </div>

                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-zinc-800">PT Session</h1>
                                <p className="text-zinc-500">Manage personal training sessions</p>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-64 text-zinc-800">
                                    <SearchInput name="keyword" />
                                </div>
                                <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/pt-sessions/create")}>
                                    New PT Session
                                </CustomButton>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/pt-sessions/${row.id}`)} />
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
