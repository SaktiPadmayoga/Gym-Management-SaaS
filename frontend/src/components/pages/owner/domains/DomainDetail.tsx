"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";
import { useDomain, useDeleteDomain, useTogglePrimaryDomain } from "@/hooks/useDomains";
import { useCreateDomainRequest, useMyDomainRequests, useCancelDomainRequest } from "@/hooks/useDomainRequests";
import { CreateDomainRequest } from "@/types/central/domain-requests";

interface DomainDetailProps {
    domainId: string;
}

/* =====================================
 * STATUS BADGE
 * ===================================== */
function StatusBadge({ status }: { status: string }) {
    const colors = {
        pending: "text-yellow-700 bg-yellow-100",
        approved: "text-green-700 bg-green-100",
        rejected: "text-red-700 bg-red-100",
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${colors[status as keyof typeof colors] ?? "text-gray-700 bg-gray-100"}`}>
            {status}
        </span>
    );
}

/* =====================================
 * REQUEST DOMAIN MODAL
 * ===================================== */
function RequestDomainModal({
    isOpen,
    onClose,
    currentDomain,
    branchId,
}: {
    isOpen: boolean;
    onClose: () => void;
    currentDomain: string;
    branchId?: string | null;
}) {
    const createMutation = useCreateDomainRequest();

    const form = useForm<CreateDomainRequest>({
        defaultValues: {
            branch_id: branchId ?? null,
            requested_domain: "",
        },
    });

    const handleSubmit = async (data: CreateDomainRequest) => {
        try {
            await createMutation.mutateAsync(data);
            toast.success("Domain request submitted successfully");
            form.reset();
            onClose();
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to submit domain request";
            toast.error(message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 font-figtree">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-zinc-800">Request Domain Change</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                        <Icon name="close" className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-zinc-50 rounded-lg text-sm text-zinc-600">
                    <span className="text-zinc-500">Current domain: </span>
                    <span className="font-medium text-zinc-800">{currentDomain}</span>
                </div>

                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
                        <TextInput
                            name="requested_domain"
                            label="Requested Domain"
                            placeholder="e.g. mygym.com"
                        />

                        <p className="text-xs text-zinc-400">
                            Your request will be reviewed by our team. You will be notified once it is approved or rejected.
                        </p>

                        <div className="flex gap-2 justify-end mt-2">
                            <CustomButton
                                type="button"
                                className="border px-4 py-2"
                                onClick={onClose}
                            >
                                Cancel
                            </CustomButton>
                            <CustomButton
                                type="submit"
                                className="bg-aksen-secondary text-white px-4 py-2"
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? "Submitting..." : "Submit Request"}
                            </CustomButton>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}

// ... StatusBadge dan RequestDomainModal tetap sama, tidak diubah ...

export default function DomainDetail({ domainId }: DomainDetailProps) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: domain, isLoading: domainLoading, isError: domainError } = useDomain(domainId);
    const deleteMutation = useDeleteDomain();
    const togglePrimaryMutation = useTogglePrimaryDomain();
    const cancelMutation = useCancelDomainRequest();

    // Tambah handling loading & error untuk requests
    const { 
        data: requestsData, 
        isLoading: requestsLoading, 
        isError: requestsError 
    } = useMyDomainRequests({ per_page: 5 });

    // Filter requests yang relevan dengan domain ini
    const domainRequests = requestsData?.data?.filter(
        (r) => r.current_domain === domain?.domain || r.requested_domain === domain?.domain
    ) ?? [];

    const handleCancelRequest = async (id: string) => {
        if (!confirm("Are you sure you want to cancel this request?")) return;
        try {
            await cancelMutation.mutateAsync(id);
            toast.success("Domain request cancelled successfully");
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to cancel domain request";
            toast.error(message);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this domain?")) return;
        try {
            await deleteMutation.mutateAsync(domainId);
            toast.success("Domain deleted successfully");
            router.back();
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to delete domain";
            toast.error(message);
        }
    };

    const handleTogglePrimary = async () => {
        try {
            await togglePrimaryMutation.mutateAsync(domainId);
            toast.success("Primary status toggled successfully");
        } catch (err: any) {
            const message = err?.response?.data?.message || "Failed to toggle primary status";
            toast.error(message);
        }
    };

    if (domainLoading) {
        return <div className="flex justify-center items-center h-64">Loading domain details...</div>;
    }

    if (domainError || !domain) {
        return (
            <div className="flex justify-center items-center h-64 text-red-500">
                Error loading domain details. Please try again.
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" richColors />

            <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                {/* Breadcrumb */}
                                    <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                                        <ul>
                                            <li>Management</li>
                                            <li>
                                                <Link href="/owner/domains">Domains</Link>
                                            </li>
                                            <li className="text-aksen-secondary">{domain.domain}</li>
                                        </ul>
                                    </div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-2 text-gray-800">
                            <Link href="/owner/domains">
                                <Icon name="back" className="h-7 w-7 cursor-pointer" />
                            </Link>
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold text-zinc-800">{domain.domain}</h1>
                        <p className="text-sm text-zinc-500 mt-1">Domain ID: {domain.id}</p>
                        </div>
                        
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <CustomButton
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete Domain"}
                        </CustomButton>
                        <CustomButton
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
                            onClick={handleTogglePrimary}
                            disabled={togglePrimaryMutation.isPending}
                        >
                            {togglePrimaryMutation.isPending 
                                ? "Toggling..." 
                                : domain.is_primary ? "Unset Primary" : "Set as Primary"}
                        </CustomButton>
                        <CustomButton
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Request Change
                        </CustomButton>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Domain Info */}
                    <div className="md:col-span-6">
                        <div className="bg-zinc-50 rounded-lg p-5 shadow-sm h-full">
                            <h3 className="font-semibold text-zinc-800 mb-4">Domain Information</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Domain</span>
                                    <span className="font-medium text-zinc-800">{domain.domain}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Is Primary</span>
                                    <span className={`font-medium ${domain.is_primary ? 'text-green-600' : 'text-zinc-800'}`}>
                                        {domain.is_primary ? "Yes" : "No"}
                                    </span>
                                </div>
                                
                            </div>
                        </div>
                    </div>

                    {/* Associations */}
                    <div className="md:col-span-6">
                        <div className="bg-zinc-50 rounded-lg p-5 shadow-sm">
                            <h3 className="font-semibold text-zinc-800 mb-4">Associations</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Tenant</span>
                                    <span className="font-medium text-zinc-800">{domain.tenant?.name || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Branch</span>
                                    <span className="font-medium text-zinc-800">{domain.branch?.name || "—"}</span>
                                </div>
                                {domain.branch?.branch_code && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-500">Branch Code</span>
                                        <span className="font-medium text-zinc-800">{domain.branch.branch_code}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Domain Change Requests — SELALU RENDER, meskipun kosong */}
                    <div className="md:col-span-12">
                        <div className="bg-zinc-50 rounded-lg p-5 shadow-sm">
                            <h3 className="font-semibold text-zinc-800 mb-4">Domain Change Requests History</h3>

                            {requestsLoading ? (
                                <div className="text-center py-6 text-zinc-500">Loading requests...</div>
                            ) : requestsError ? (
                                <div className="text-center py-6 text-red-500">Failed to load requests</div>
                            ) : domainRequests.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {domainRequests.map((req) => (
                                        <div
                                            key={req.id}
                                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border rounded-lg px-4 py-3 text-sm gap-3"
                                        >
                                            <div className="flex flex-col gap-1 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-zinc-500">Requested:</span>
                                                    <span className="font-medium text-zinc-800">{req.requested_domain}</span>
                                                    <StatusBadge status={req.status} />
                                                </div>
                                                {req.rejection_reason && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        Reason: {req.rejection_reason}
                                                    </p>
                                                )}
                                                <p className="text-xs text-zinc-400 mt-1">
                                                    Submitted: {new Date(req.created_at).toLocaleDateString("en-US", {
                                                        month: "short", day: "numeric", year: "numeric",
                                                    })}
                                                </p>
                                            </div>

                                            {req.status === "pending" && (
                                                <CustomButton
                                                    className="text-red-500 border border-red-200 hover:bg-red-50 text-xs px-3 py-1.5 mt-2 sm:mt-0 whitespace-nowrap"
                                                    onClick={() => handleCancelRequest(req.id)}
                                                    disabled={cancelMutation.isPending}
                                                >
                                                    Cancel
                                                </CustomButton>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-zinc-500">
                                    No domain change requests yet for this domain.
                                    <br />
                                    <button 
                                        className="text-green-600 hover:underline mt-2 text-sm"
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        Request a change now →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="md:col-span-12 text-sm text-zinc-500 mt-2">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div>
                                Created: {domain.created_at 
                                    ? new Date(domain.created_at).toLocaleString("en-US", {
                                        month: "short", day: "numeric", year: "numeric",
                                        hour: "2-digit", minute: "2-digit"
                                      }) 
                                    : "—"}
                            </div>
                            <div>
                                Updated: {domain.updated_at 
                                    ? new Date(domain.updated_at).toLocaleString("en-US", {
                                        month: "short", day: "numeric", year: "numeric",
                                        hour: "2-digit", minute: "2-digit"
                                      }) 
                                    : "—"}
                            </div>
                        </div>
                    </div>
                </div>

                <RequestDomainModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    currentDomain={domain.domain}
                    branchId={domain.branch?.id ?? null}
                />
            </div>
        </>
    );
}