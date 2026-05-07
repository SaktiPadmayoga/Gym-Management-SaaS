"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";

import CustomTable, { Column, ActionItem } from "@/components/ui/table/CustomTable";
import { SearchInput } from "@/components/ui/input/Input";
import CustomButton from "@/components/ui/button/CustomButton";
import PaginationWithRows from "@/components/ui/navigation/PaginationWithRows";

import { useDomains, useDeleteDomain, useTogglePrimaryDomain } from "@/hooks/useDomains";
import { DomainData } from "@/types/central/domains";

import { useDomainRequests, useReviewDomainRequest } from "@/hooks/useDomainRequests";
import { DomainRequestData } from "@/types/central/domain-requests";
import { useDebounce } from "@/hooks/useDebounce";

const BASE_PATH = "/admin/domains";

type DomainSearchForm = {
    search: string;
};

interface TabProps {
    activeTab: string;
    setTab: (tab: string) => void;
}

/* =====================================
 * TAB UI (Disematkan ke dalam container)
 * ===================================== */
function TabsUI({ activeTab, setTab }: TabProps) {
    return (
        <div className="flex gap-1 mb-6 border-b border-zinc-100">
            <button
                type="button"
                onClick={() => setTab("domains")}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === "domains"
                        ? "border-aksen-secondary text-aksen-secondary"
                        : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
            >
                Domains
            </button>
            <button
                type="button"
                onClick={() => setTab("requests")}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === "requests"
                        ? "border-aksen-secondary text-aksen-secondary"
                        : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
            >
                Domain Requests
            </button>
        </div>
    );
}

/* =====================================
 * TAB 1: DOMAINS (Style & Logika Asli)
 * ===================================== */
function DomainsTab({ activeTab, setTab }: TabProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const hasShownToast = useRef(false);

    const [page, setPage] = useState(() => Number(searchParams.get("page")) || 1);
    const [perPage, setPerPage] = useState(() => Number(searchParams.get("per_page")) || 5);

    const form = useForm<DomainSearchForm>({
        defaultValues: {
            search: searchParams.get("search") || "",
        },
    });

    const searchValue = form.watch("search");
    const debouncedSearch = useDebounce(searchValue, 500);

    const { data, isLoading, isError } = useDomains({
        search: debouncedSearch,
        page,
        per_page: perPage,
    });

    const deleteMutation = useDeleteDomain();
    const togglePrimaryMutation = useTogglePrimaryDomain();

    useEffect(() => {
        const params = new URLSearchParams();
        params.set("tab", "domains"); // Set tab active state
        if (debouncedSearch) params.set("search", debouncedSearch);
        params.set("page", String(page));
        params.set("per_page", String(perPage));

        // ✅ Ganti ke admin path
        router.replace(`${BASE_PATH}?${params.toString()}`);
    }, [debouncedSearch, page, perPage, router]);

    useEffect(() => {
        const success = searchParams.get("success");
        const updated = searchParams.get("updated");
        const deleted = searchParams.get("deleted");

        if (!success && !updated && !deleted) {
            hasShownToast.current = false;
            return;
        }

        if (success === "true" && !hasShownToast.current) {
            toast.success("Domain created successfully");
            hasShownToast.current = true;
        }
        if (updated === "true" && !hasShownToast.current) {
            toast.success("Domain updated successfully");
            hasShownToast.current = true;
        }
        if (deleted === "true" && !hasShownToast.current) {
            toast.success("Domain deleted successfully");
            hasShownToast.current = true;
        }

        // ✅ Ganti ke admin path
        window.history.replaceState({}, "", `${BASE_PATH}?tab=domains`);
    }, [searchParams]);

    const entries: DomainData[] = data?.data ?? [];
    const totalData = data?.meta?.total ?? entries.length;

    if (isError) {
        toast.error("Error loading domains");
        return <div className="py-10 text-center text-red-500">Error loading domains.</div>;
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case "tenant": return "text-blue-600 bg-blue-600/10";
            case "branch": return "text-green-600 bg-green-600/10";
            case "custom": return "text-purple-600 bg-purple-600/10";
            default: return "text-gray-600 bg-gray-600/10";
        }
    };

    const columns: Column<DomainData>[] = [
        {
            header: "Domain",
            render: (item) => (
                <div>
                    <div className="font-semibold text-zinc-800">{item.domain}</div>
                </div>
            ),
            width: "w-44",
        },
        {
            header: "Type",
            render: (item) => (
                <span className={`inline-block rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${getTypeColor(item.type)}`}>
                    {item.type}
                </span>
            ),
            width: "w-40",
        },
        {
            header: "Tenant",
            render: (item) => (
                <div className="text-sm">
                    <div className="text-zinc-700">{item.tenant?.name || "—"}</div>
                    {item.tenant?.slug && <div className="text-xs text-zinc-500 mt-0.5">{item.tenant.slug}</div>}
                </div>
            ),
            width: "w-40",
        },
        {
            header: "Created",
            render: (item) => (
                <div className="text-sm">
                    <div className="text-zinc-700">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                        }) : "—"}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString("en-US", {
                            hour: "2-digit", minute: "2-digit",
                        }) : ""}
                    </div>
                </div>
            ),
            width: "w-32",
        },
    ];

    const actions: ActionItem<DomainData>[] = [
        {
            label: "View Detail",
            icon: "eye",
            className: "text-zinc-800",
            // ✅ Ganti ke admin path
            onClick: (row) => router.push(`/admin/domains/${row.id}`),
        },
        {
            label: "Edit",
            icon: "edit",
            className: "text-blue-600 hover:bg-blue-50",
            onClick: (row) => router.push(`/admin/domains/${row.id}/edit`),
        },
        {
            label: "Toggle Primary",
            icon: "archive",
            className: "text-orange-600 hover:bg-orange-50",
            onClick: (row) => togglePrimaryMutation.mutate(row.id),
        },
        {
            label: "Delete",
            icon: "trash",
            className: "text-red-600 hover:bg-red-50",
            divider: true,
            onClick: (row) => {
                if (confirm(`Are you sure you want to delete domain "${row.domain}"?`)) {
                    deleteMutation.mutate(row.id);
                }
            },
        },
    ];

    return (
        <FormProvider {...form}>
            <div>
                {/* Kotak Putih Utama (Original) */}
                <div className="rounded-xl font-figtree bg-white border border-gray-500/20 px-6 py-4">
                    <Toaster position="top-center" />

                    {/* ✅ Breadcrumb admin */}
                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                        <ul>
                            <li>Tenant & Subscription</li>
                            <li className="text-aksen-secondary">Domains</li>
                        </ul>
                    </div>

                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">Domains</h1>
                            <p className="text-zinc-500">Manage all tenant domain configurations</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-64 text-zinc-800">
                                <SearchInput name="search" />
                            </div>
                        </div>
                    </div>

                    {/* TAB DISINI - Di dalam kotak putih */}
                    <TabsUI activeTab={activeTab} setTab={setTab} />

                    <div className="overflow-x-auto">
                        {isLoading ? (
                            <div className="space-y-3">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                                ))}
                            </div>
                        ) : entries.length === 0 ? (
                            <div className="py-10 text-center text-zinc-500">
                                No domains found.
                            </div>
                        ) : (
                            <CustomTable
                                columns={columns}
                                data={entries}
                                actions={actions}
                                onRowClick={(row) => router.push(`/admin/domains/${row.id}`)}
                            />
                        )}
                    </div>

                    {entries.length > 0 && (
                        <div className="mt-4 text-sm text-zinc-500">
                            Showing {entries.length} of {totalData} domains
                        </div>
                    )}
                    <div className="mt-4">
                    <PaginationWithRows
                        hasNextPage={data?.meta?.current_page ? data.meta.current_page < (data.meta.last_page || 1) : false}
                        hasPrevPage={(data?.meta?.current_page ?? 0) > 1}
                        totalItems={totalData}
                        currentPage={page}
                        currentPerPage={perPage}
                        onPageChange={setPage}
                        onRowsPerPageChange={setPerPage}
                        rowOptions={[5, 10, 15, 20, 50]}
                        defaultRowsPerPage={15}
                    />
                </div>
                </div>

                
            </div>
        </FormProvider>
    );
}

/* =====================================
 * STATUS BADGE & MODAL (Dari DomainRequests asli)
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
 * TAB 2: REQUESTS (Style & Logika Asli)
 * ===================================== */
function RequestsTab({ activeTab, setTab }: TabProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = Number(searchParams.get("page")) || 1;
    const perPage = Number(searchParams.get("per_page")) || 5;

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
            icon: "eye", // Mengikuti icon original dari file request Anda
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

                {/* Kotak Putih Utama (Original) */}
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

                    {/* TAB DISINI - Di dalam kotak putih */}
                    <TabsUI activeTab={activeTab} setTab={setTab} />

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

                
            </div>
        </FormProvider>
    );
}

/* =====================================
 * MAIN PAGE EXPORT
 * ===================================== */
export default function DomainsManagementPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Tab State Default ("domains" atau "requests")
    const activeTab = searchParams.get("tab") || "domains";

    const setTab = (tab: string) => {
        router.push(`${BASE_PATH}?tab=${tab}`);
    };

    if (activeTab === "requests") {
        return <RequestsTab activeTab={activeTab} setTab={setTab} />;
    }

    return <DomainsTab activeTab={activeTab} setTab={setTab} />;
}