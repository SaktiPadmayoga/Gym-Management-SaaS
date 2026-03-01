"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { MembershipData, MembershipDataWithKeyword } from "@/types/membership";
import { DUMMY_MEMBERSHIPS } from "@/lib/dummy/membershipDummy";
// import { ProfileData } from "@/lib/dummy/profileDummy";
import { DUMMY_MEMBERSHIP_PLANS } from "@/lib/dummy/membershipPlanDummy";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";

/* =======================
   HELPER RESOLVER
======================= */
// const getMemberName = (profileId?: string) => {
//     return ProfileData.find((p) => p.id === profileId)?.name ?? "-";
// };

const getPlanName = (planId?: string) => {
    return DUMMY_MEMBERSHIP_PLANS.find((p) => p.id === planId)?.name ?? "-";
};

export default function Membership() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const form = useForm<MembershipDataWithKeyword>({
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
            toast.success("Membership created successfully");
        }

        if (updated === "true" && !hasShownToast.current) {
            toast.success("Membership updated successfully");
        }

        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Membership deleted successfully");
        }

        hasShownToast.current = true;
        window.history.replaceState({}, "", "/membership");
    }, [searchParams]);

    /* =======================
       TABLE COLUMNS
    ======================= */
    const columns: Column<MembershipData>[] = [
        {
            header: "ID",
            render: (item) => <span className="font-medium">{item.id}</span>,
            width: "w-32",
        },
        {
            header: "Member",
            render: (item) => (
                // <Link href={`/membership/${item.id}`} className="font-medium hover:underline">
                //     {getMemberName(item.memberProfileId)}
                // </Link>
                <span className="font-medium">{item.id}</span>
            ),
            width: "w-56",
        },
        {
            header: "Plan",
            render: (item) => <span className="font-medium">{getPlanName(item.membershipPlanId)}</span>,
            width: "w-56",
        },
        {
            header: "Join Date",
            render: (item) => <span>{item.joinDate}</span>,
            width: "w-40",
        },
        {
            header: "Status",
            render: (item) => (
                <span
                    className={`rounded-lg px-3 py-1 font-medium ${
                        item.membershipStatus === "Active" ? "text-green-600 bg-green-600/10" : item.membershipStatus === "Expired" ? "text-red-600 bg-red-600/10" : "text-zinc-600 bg-zinc-600/10"
                    }`}
                >
                    {item.membershipStatus}
                </span>
            ),
            width: "w-32",
        },
    ];

    /* =======================
       ROW ACTIONS
    ======================= */
    const actions: ActionItem<MembershipData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            onClick: (row) => router.push(`/membership/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/membership/${row.id}`),
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: () => {
                if (confirm("Are you sure you want to delete this membership?")) {
                    toast.success("Membership deleted");
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

    const entries = DUMMY_MEMBERSHIPS.slice(start, end);

    const showingFrom = entries.length === 0 ? 0 : start + 1;
    const showingTo = Math.min(end, DUMMY_MEMBERSHIPS.length);
    const totalData = DUMMY_MEMBERSHIPS.length;

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
                                <li className="text-aksen-secondary">Membership</li>
                            </ul>
                        </div>

                        {/* Header */}
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-semibold text-zinc-800">Membership</h1>
                                <p className="text-zinc-500">Manage member memberships</p>
                            </div>

                            <div className="flex gap-3">
                                <div className="w-64 text-zinc-800">
                                    <SearchInput name="keyword" />
                                </div>
                                <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/membership/create")}>
                                    New Membership
                                </CustomButton>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/membership/${row.id}`)} />
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
