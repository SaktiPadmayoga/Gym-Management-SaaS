"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { FormProvider, useForm } from "react-hook-form";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import CustomButton from "@/components/ui/button/CustomButton";
import { SearchInput } from "@/components/ui/input/Input";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";
import { useDomainRequests, useReviewDomainRequest } from "@/hooks/useDomainRequests";
import { DomainRequestData } from "@/types/central/domain-requests";

/* =====================================
 * STATUS BADGE
 * ===================================== */
function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        pending: "text-yellow-700 bg-yellow-100",
        approved: "text-green-700 bg-green-100",
        rejected: "text-red-700 bg-red-100",
    };
    return (
        <span className={`text-xs px-2 py-1 rounded font-medium capitalize ${colors[status] ?? "text-gray-700 bg-gray-100"}`}>
            {status}
        </span>
    );
}

/* =====================================
 * REJECT MODAL
 * ===================================== */
function RejectModal({
    isOpen,
    onClose,
    onConfirm,
    isPending,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isPending: boolean;
}) {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 font-figtree">
                <h2 className="text-lg font-semibold text-zinc-800 mb-4">Reject Domain Request</h2>
                <p className="text-sm text-zinc-500 mb-3">Please provide a reason for rejection:</p>
                <textarea
                    className="w-full border rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300"
                    rows={3}
                    placeholder="e.g. Domain format is invalid"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
                <div className="flex gap-2 justify-end mt-4">
                    <CustomButton type="button" className="border px-4 py-2" onClick={onClose}>
                        Cancel
                    </CustomButton>
                    <CustomButton
                        type="button"
                        className="bg-red-500 text-white px-4 py-2"
                        onClick={() => onConfirm(reason)}
                        disabled={!reason.trim() || isPending}
                    >
                        {isPending ? "Rejecting..." : "Reject"}
                    </CustomButton>
                </div>
            </div>
        </div>
    );
}

/* =====================================
 * MAIN PAGE
 * ===================================== */
export default function DomainRequests() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("per_page")) || 15;

    const [rejectModal, setRejectModal] = useState<{ open: boolean; id: string | null }>({
        open: false,
        id: null,
    });

    const form = useForm({ defaultValues: { search: "" } });
    const searchValue = form.watch("search");

    const { data, isLoading } = useDomainRequests({
        page,
        per_page: perPage,
        search: searchValue,
    });

    const reviewMutation = useReviewDomainRequest();

    const entries: DomainRequestData[] = data?.data ?? [];
    const totalData = data?.meta?.total ?? 0;

    const handleApprove = async (id: string) => {
        if (!confirm("Are you sure you want to approve this domain request?")) return;
        try {
            await reviewMutation.mutateAsync({ id, payload: { action: "approve" } });
            toast.success("Domain request approved successfully");
        } catch {
            toast.error("Failed to approve domain request");
        }
    };

    const handleReject = async (id: string, reason: string) => {
        try {
            await reviewMutation.mutateAsync({
                id,
                payload: { action: "reject", rejection_reason: reason },
            });
            toast.success("Domain request rejected");
            setRejectModal({ open: false, id: null });
        } catch {
            toast.error("Failed to reject domain request");
        }
    };

    const columns: Column<DomainRequestData>[] = [
        {
            header: "Tenant",
            render: (item) => (
                <div>
                    <div className="font-medium text-zinc-800">{item.tenant?.name ?? item.tenant_id}</div>
                    <div className="text-xs text-zinc-500">{item.tenant?.slug}</div>
                </div>
            ),
            width: "w-40",
        },
        {
            header: "Current Domain",
            render: (item) => <span className="text-sm text-zinc-700">{item.current_domain}</span>,
            width: "w-48",
        },
        {
            header: "Requested Domain",
            render: (item) => <span className="text-sm font-medium text-zinc-800">{item.requested_domain}</span>,
            width: "w-48",
        },
        {
            header: "Type",
            render: (item) => (
                <span className="text-xs text-zinc-500 capitalize">
                    {item.branch_id ? "Branch" : "Tenant"}
                </span>
            ),
            width: "w-24",
        },
        {
            header: "Status",
            render: (item) => <StatusBadge status={item.status} />,
            width: "w-28",
        },
        {
            header: "Rejection Reason",
            render: (item) => (
                <span className="text-xs text-red-500">{item.rejection_reason ?? "-"}</span>
            ),
            width: "w-48",
        },
        {
            header: "Submitted",
            render: (item) => (
                <div className="text-sm text-zinc-500">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    })}
                </div>
            ),
            width: "w-32",
        },
    ];

    const actions: ActionItem<DomainRequestData>[] = [
        {
            label: "Approve",
            icon: "eye",
            className: "text-green-600 hover:bg-green-50",
            onClick: (row) => {
                if (row.status !== "pending") {
                    toast.error("Only pending requests can be reviewed");
                    return;
                }
                handleApprove(row.id);
            },
        },
        {
            label: "Reject",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (row.status !== "pending") {
                    toast.error("Only pending requests can be reviewed");
                    return;
                }
                setRejectModal({ open: true, id: row.id });
            },
        },
    ];

    return (
        <FormProvider {...form}>
            <div>
                <RejectModal
                    isOpen={rejectModal.open}
                    onClose={() => setRejectModal({ open: false, id: null })}
                    onConfirm={(reason) => {
                        if (rejectModal.id) handleReject(rejectModal.id, reason);
                    }}
                    isPending={reviewMutation.isPending}
                />

                <div className="rounded-xl font-figtree bg-white border border-gray-500/20 px-6 py-4">
                    <Toaster position="top-center" />

                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Tenant & Subscription</li>
                            <li className="text-aksen-secondary">Domain Requests</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Domain Requests</h1>
                            <p className="text-zinc-500">Review and manage tenant domain change requests</p>
                        </div>
                        <div className="w-64 text-zinc-800">
                            <SearchInput name="search" />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <CustomTable
                                columns={columns}
                                data={entries}
                                actions={actions}
                            />
                        )}
                    </div>

                    <div className="mt-4 text-sm text-zinc-500">
                        Showing {entries.length} of {totalData} requests
                    </div>
                </div>

                <div className="mt-4">
                    <PaginationWithRows
                        hasNextPage={data?.meta?.current_page && data?.meta?.last_page
                            ? data.meta.current_page < data.meta.last_page
                            : false}
                        hasPrevPage={(data?.meta?.current_page ?? 0) > 1}
                        totalItems={totalData}
                        rowOptions={[5, 10, 15, 20, 50]}
                        defaultRowsPerPage={perPage}
                    />
                </div>
            </div>
        </FormProvider>
    );
}