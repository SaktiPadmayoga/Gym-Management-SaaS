"use client";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { MemberData, MemberDataWithKeyword } from "@/types/tenant/members";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useMembers, useDeleteMember } from "@/hooks/tenant/useMembers";
import { useDebounce } from "@/hooks/useDebounce";

/* =========================
 * STATUS BADGE
 * ========================= */

const memberStatusColor: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-zinc-100 text-zinc-500",
    expired: "bg-orange-100 text-orange-700",
    frozen: "bg-blue-100 text-blue-700",
    banned: "bg-red-100 text-red-700",
};

export default function Members() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 15);

    const form = useForm<MemberDataWithKeyword>({
        defaultValues: { search: searchParams.get("search") || "" },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = useMembers({
        search: debouncedSearch,
        page,
        per_page: perPage,
    });

    const deleteMutation = useDeleteMember();

    // Sync URL
    useEffect(() => {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));
        router.replace(`/members?${params.toString()}`);
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
            toast.success("Member created successfully");
            hasShownToast.current = true;
        }
        if (updated === "true" && !hasShownToast.current) {
            toast.success("Member updated successfully");
            hasShownToast.current = true;
        }
        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Member deleted successfully");
            hasShownToast.current = true;
        }

        window.history.replaceState({}, "", "/members");
    }, [searchParams]);

    const entries: MemberData[] = data ?? [];
    const totalData = entries.length;

    if (isError) {
        toast.error("Error loading members");
        return <div className="py-10 text-center text-red-500">Error loading members</div>;
    }

    /* =========================
     * TABLE COLUMNS
     * ========================= */
    const columns: Column<MemberData>[] = [
        {
            header: "Name",
            render: (item) => (
                <div className="flex items-center gap-2">
                    {item.avatar ? (
                        <img src={item.avatar} alt={item.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-semibold text-sm">{item.name.charAt(0).toUpperCase()}</div>
                    )}
                    <div>
                        <Link href={`/members/${item.id}`} className="font-medium text-zinc-800 hover:underline">
                            {item.name}
                        </Link>
                        {item.current_membership?.member_code && <p className="text-xs text-zinc-400">{item.current_membership.member_code}</p>}
                    </div>
                </div>
            ),
            width: "w-52",
        },
        {
            header: "Contact",
            render: (item) => (
                <div>
                    <p className="text-sm text-zinc-700">{item.phone ?? "-"}</p>
                    <p className="text-xs text-zinc-400">{item.email ?? ""}</p>
                </div>
            ),
            width: "w-44",
        },
        {
            header: "Status",
            render: (item) => <span className={`rounded-lg px-2 py-1 text-xs font-medium capitalize ${memberStatusColor[item.status] ?? "bg-zinc-100 text-zinc-600"}`}>{item.status}</span>,
            width: "w-28",
        },
        {
            header: "Membership",
            render: (item) => {
                const mb = item.current_membership ?? item.branches?.[0];
                if (!mb) return <span className="text-zinc-400 text-sm">No membership</span>;
                return (
                    <div>
                        <p className="text-sm text-zinc-700">{mb.expires_at ? new Date(mb.expires_at).toLocaleDateString() : "-"}</p>
                        {mb.days_until_expiry !== null && mb.days_until_expiry !== undefined && (
                            <p className={`text-xs ${mb.days_until_expiry <= 7 ? "text-orange-500" : "text-zinc-400"}`}>{mb.days_until_expiry > 0 ? `${mb.days_until_expiry}d left` : "Expired"}</p>
                        )}
                    </div>
                );
            },
            width: "w-36",
        },
        {
            header: "Gender",
            render: (item) => <span className="text-sm text-zinc-500 capitalize">{item.gender ?? "-"}</span>,
            width: "w-24",
        },
        {
            header: "Member Since",
            render: (item) => <span className="text-sm text-zinc-500">{item.member_since ? new Date(item.member_since).toLocaleDateString() : "-"}</span>,
            width: "w-32",
        },
        {
            header: "Last Check-in",
            render: (item) => <span className="text-sm text-zinc-500">{item.last_checkin_at ? new Date(item.last_checkin_at).toLocaleDateString() : "-"}</span>,
            width: "w-32",
        },
    ];

    /* =========================
     * ROW ACTIONS
     * ========================= */
    const actions: ActionItem<MemberData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            onClick: (row) => router.push(`/members/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/members/${row.id}/edit`),
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm("Are you sure you want to delete this member?")) {
                    deleteMutation.mutate(row.id, {
                        onSuccess: () => toast.success("Member deleted"),
                        onError: () => toast.error("Failed to delete member"),
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
                            <li>Management</li>
                            <li className="text-aksen-secondary">Members</li>
                        </ul>
                    </div>

                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Members</h1>
                            <p className="text-zinc-500">Manage gym members and their memberships</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" />
                            </div>
                            <CustomButton iconName="plus" className="text-white px-3" onClick={() => router.push("/members/create")}>
                                New Member
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
                            <CustomTable columns={columns} data={entries} actions={actions} onRowClick={(row) => router.push(`/members/${row.id}`)} />
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
