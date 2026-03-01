"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { useDomain, useDeleteDomain, useTogglePrimaryDomain } from "@/hooks/useDomains";

export default function AdminDomainDetail() {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const { data: domain, isLoading, isError } = useDomain(id);
    const deleteMutation = useDeleteDomain();
    const togglePrimaryMutation = useTogglePrimaryDomain();

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete domain "${domain?.domain}"?`)) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Domain deleted successfully");
            router.push("/admin/domains");
        } catch {
            toast.error("Failed to delete domain");
        }
    };

    const handleTogglePrimary = async () => {
        try {
            await togglePrimaryMutation.mutateAsync(id);
            toast.success("Primary status updated successfully");
        } catch {
            toast.error("Failed to update primary status");
        }
    };

    if (isLoading || !domain) return <div className="p-6">Loading...</div>;
    if (isError) return <div className="p-6 text-red-500">Error loading domain details.</div>;

    const getTypeColor = (type: string) => {
        switch (type) {
            case "tenant": return "text-blue-600 bg-blue-50 border-blue-200";
            case "branch": return "text-green-600 bg-green-50 border-green-200";
            case "custom": return "text-purple-600 bg-purple-50 border-purple-200";
            default: return "text-gray-600 bg-gray-50 border-gray-200";
        }
    };

    return (
        <>
            <Toaster position="top-center" />

            <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                {/* Breadcrumb */}
                <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                    <ul>
                        <li>Tenant & Subscription</li>
                        <li><Link href="/admin/domains">Domains</Link></li>
                        <li className="text-aksen-secondary">{domain.domain}</li>
                    </ul>
                </div>

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-800">
                        <Link href="/admin/domains">
                            <Icon name="back" className="h-7 w-7 cursor-pointer" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-semibold text-zinc-800">{domain.domain}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-md border font-medium capitalize ${getTypeColor(domain.type)}`}>
                                    {domain.type}
                                </span>
                                {domain.is_primary && (
                                    <span className="text-xs px-2 py-0.5 rounded-md border font-medium text-yellow-700 bg-yellow-50 border-yellow-200">
                                        Primary
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <CustomButton
                            type="button"
                            className="border border-zinc-200 text-zinc-700 hover:bg-zinc-50 px-4 py-2.5"
                            onClick={handleTogglePrimary}
                            disabled={togglePrimaryMutation.isPending}
                        >
                            {togglePrimaryMutation.isPending
                                ? "Updating..."
                                : domain.is_primary ? "Unset Primary" : "Set as Primary"}
                        </CustomButton>
                        <CustomButton
                            type="button"
                            className="border border-zinc-200 text-blue-600 hover:bg-blue-50 px-4 py-2.5"
                            onClick={() => router.push(`/admin/domains/${id}/edit`)}
                        >
                            Edit
                        </CustomButton>
                        <CustomButton
                            type="button"
                            className="bg-red-500 text-white hover:bg-red-600 px-4 py-2.5"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </CustomButton>
                    </div>
                </div>

                <hr className="border-zinc-100" />

                <div className="mt-6 grid grid-cols-12 gap-4">
                    {/* Domain Info */}
                    <div className="col-span-6">
                        <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5">
                            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
                                Domain Information
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                                    <span className="text-sm text-zinc-500">Domain</span>
                                    <span className="text-sm font-medium text-zinc-800">{domain.domain}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                                    <span className="text-sm text-zinc-500">Type</span>
                                    <span className={`text-xs px-2 py-1 rounded-md border font-medium capitalize ${getTypeColor(domain.type)}`}>
                                        {domain.type}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-zinc-500">Primary</span>
                                    <span className={`text-sm font-medium ${domain.is_primary ? "text-green-600" : "text-zinc-400"}`}>
                                        {domain.is_primary ? "Yes" : "No"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Associations */}
                    <div className="col-span-6">
                        <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5">
                            <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
                                Associations
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-zinc-100">
                                    <span className="text-sm text-zinc-500">Tenant</span>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-zinc-800">{domain.tenant?.name || "—"}</div>
                                        {domain.tenant?.slug && (
                                            <div className="text-xs text-zinc-400">{domain.tenant.slug}</div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm text-zinc-500">Branch</span>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-zinc-800">{domain.branch?.name || "—"}</div>
                                        {domain.branch?.branch_code && (
                                            <div className="text-xs text-zinc-400">{domain.branch.branch_code}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps */}
                    <div className="col-span-12">
                        <div className="flex gap-6 text-xs text-zinc-400 pt-2">
                            <span>
                                Created:{" "}
                                {domain.created_at
                                    ? new Date(domain.created_at).toLocaleString("en-US", {
                                          month: "short", day: "numeric", year: "numeric",
                                          hour: "2-digit", minute: "2-digit",
                                      })
                                    : "—"}
                            </span>
                            <span>
                                Updated:{" "}
                                {domain.updated_at
                                    ? new Date(domain.updated_at).toLocaleString("en-US", {
                                          month: "short", day: "numeric", year: "numeric",
                                          hour: "2-digit", minute: "2-digit",
                                      })
                                    : "—"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}