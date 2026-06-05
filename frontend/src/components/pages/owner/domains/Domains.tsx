"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { AxiosError } from "axios";

import { Icon } from "@/components/icon";
import CustomButton from "@/components/ui/button/CustomButton";
import { TextInput } from "@/components/ui/input/Input";

// ✅ Import useTenantHeader untuk mendapatkan current_domain_id
import { useTenantHeader } from "@/hooks/useTenantHeader";
// ✅ Menggunakan useDomain (singular) untuk mengambil detail berdasarkan ID
import { useDomain, useDeleteDomain, useTogglePrimaryDomain } from "@/hooks/useDomains";
import { useCreateDomainRequest, useMyDomainRequests, useCancelDomainRequest } from "@/hooks/useDomainRequests";
import { CreateDomainRequest } from "@/types/central/domain-requests";

/* =====================================
 * STATUS BADGE
 * ===================================== */
function StatusBadge({ status }: { status: string }) {
    const colors = {
        pending: "text-yellow-700 bg-yellow-100",
        approved: "text-green-700 bg-green-100",
        rejected: "text-red-700 bg-red-100",
    };
    const labels = {
        pending: "Menunggu",
        approved: "Disetujui",
        rejected: "Ditolak",
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${colors[status as keyof typeof colors] ?? "text-gray-700 bg-gray-100"}`}>
            {labels[status as keyof typeof labels] ?? status}
        </span>
    );
}

/* =====================================
 * REQUEST DOMAIN MODAL
 * ===================================== */
function RequestDomainModal({ isOpen, onClose, currentDomain, branchId }: { isOpen: boolean; onClose: () => void; currentDomain: string; branchId?: string | null }) {
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
            toast.success("Permintaan perubahan domain berhasil dikirim");
            form.reset();
            onClose();
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const message = error.response?.data?.message || "Gagal mengirim permintaan perubahan domain";
            toast.error(message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal */}
            <div className="relative z-10 bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 font-figtree">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-zinc-800">Ajukan Perubahan Domain</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
                        <Icon name="close" className="h-5 w-5" />
                    </button>
                </div>

                <div className="mb-4 p-3 bg-zinc-50 rounded-lg text-sm text-zinc-600">
                    <span className="text-zinc-500">Domain saat ini: </span>
                    <span className="font-medium text-zinc-800">{currentDomain}</span>
                </div>

                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
                        <TextInput
                            name="requested_domain"
                            label="Domain yang Diajukan"
                            placeholder="contoh: gymsaya.com"
                            rules={{
                                required: "Domain yang diajukan wajib diisi",
                            }}
                        />

                        <p className="text-xs text-zinc-400">Permintaan Anda akan ditinjau oleh tim kami. Anda akan menerima notifikasi setelah disetujui atau ditolak.</p>

                        <div className="flex gap-2 justify-end mt-2">
                            <CustomButton type="button" className="border px-4 py-2" onClick={onClose}>
                                Batal
                            </CustomButton>
                            <CustomButton type="submit" className="bg-aksen-secondary text-white px-4 py-2" disabled={createMutation.isPending}>
                                {createMutation.isPending ? "Mengirim..." : "Kirim Permintaan"}
                            </CustomButton>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </div>
    );
}

/* =====================================
 * MAIN PAGE COMPONENT
 * ===================================== */
export default function OwnerDomainPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: tenant, isLoading: tenantLoading, isError: tenantError } = useTenantHeader();
    const currentDomainId = tenant?.current_domain_id;

    const { data: domain, isLoading: domainLoading, isError: domainError } = useDomain(currentDomainId as string);

    const deleteMutation = useDeleteDomain();
    const togglePrimaryMutation = useTogglePrimaryDomain();
    const cancelMutation = useCancelDomainRequest();

    const { data: requestsData, isLoading: requestsLoading, isError: requestsError } = useMyDomainRequests({ per_page: 5 });

    const domainRequests = requestsData?.data?.filter((r) => r.current_domain === domain?.domain || r.requested_domain === domain?.domain) ?? [];

    const handleCancelRequest = (id: string) => {
        toast("Apakah Anda yakin ingin membatalkan permintaan ini?", {
            action: {
                label: "Konfirmasi",
                onClick: async () => {
                    try {
                        await cancelMutation.mutateAsync(id);
                        toast.success("Permintaan perubahan domain berhasil dibatalkan");
                    } catch (err) {
                        const error = err as AxiosError<{ message: string }>;
                        const message = error.response?.data?.message || "Gagal membatalkan permintaan perubahan domain";
                        toast.error(message);
                    }
                },
            },
            cancel: {
                label: "Batal",
                onClick: () => console.log("Pembatalan diabaikan"),
            },
            duration: 5000,
        });
    };

    if (tenantLoading || domainLoading) {
        return <div className="flex justify-center items-center h-64">Memuat detail domain...</div>;
    }

    if (tenantError || domainError || !domain) {
        return <div className="flex justify-center items-center h-64 text-red-500">Gagal memuat detail domain. Silakan coba lagi.</div>;
    }

    return (
        <>
            <Toaster position="top-center" />

            <div className="font-figtree rounded-xl bg-white border px-6 py-4">
                {/* Breadcrumb */}
                <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                    <ul>
                        <li>Penyewa & Langganan</li>
                        <li className="text-aksen-secondary">Domain</li>
                    </ul>
                </div>
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                    <div className="flex items-center gap-2 text-gray-800">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-bold text-zinc-800">{domain.domain}</h1>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <CustomButton className="bg-aksen-secondary border-none text-white px-4 py-2" onClick={() => setIsModalOpen(true)}>
                            Ajukan Perubahan
                        </CustomButton>
                    </div>
                </div>

                <hr />

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
                    {/* Domain Info */}
                    <div className="md:col-span-4">
                        <div className="bg-zinc-50 rounded-lg p-5 shadow-sm h-full">
                            <h3 className="font-semibold text-zinc-800 mb-4">Informasi Domain</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Nama domain</span>
                                    <span className="font-medium text-zinc-800">{domain.domain}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Penyewa (Tenant)</span>
                                    <span className="font-medium text-zinc-800">{domain.tenant?.name || "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Dibuat pada</span>
                                    <span className="text-zinc-800">
                                        {domain.created_at
                                            ? new Date(domain.created_at).toLocaleString("id-ID", {
                                                  month: "short",
                                                  day: "numeric",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              })
                                            : "—"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Diperbarui pada</span>
                                    <span className="text-zinc-800">
                                        {domain.updated_at
                                            ? new Date(domain.updated_at).toLocaleString("id-ID", {
                                                  month: "short",
                                                  day: "numeric",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                              })
                                            : "—"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Domain Change Requests — SELALU RENDER, meskipun kosong */}
                    <div className="md:col-span-8 h-full">
                        <div className="bg-zinc-50 rounded-lg p-5 shadow-sm h-full">
                            <h3 className="font-semibold text-zinc-800 mb-4">Riwayat Permintaan Perubahan Domain</h3>

                            {requestsLoading ? (
                                <div className="text-center py-6 text-zinc-500">Memuat permintaan...</div>
                            ) : requestsError ? (
                                <div className="text-center py-6 text-red-500">Gagal memuat permintaan</div>
                            ) : domainRequests.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {domainRequests.map((req) => (
                                        <div key={req.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border rounded-lg px-4 py-3 text-sm gap-3">
                                            <div className="flex flex-col gap-1 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-zinc-500">Diajukan:</span>
                                                    <span className="font-medium text-zinc-800">{req.requested_domain}</span>
                                                    <StatusBadge status={req.status} />
                                                </div>
                                                {req.rejection_reason && <p className="text-xs text-red-500 mt-1">Alasan: {req.rejection_reason}</p>}
                                                <p className="text-xs text-zinc-400 mt-1">
                                                    Dikirim:{" "}
                                                    {new Date(req.created_at).toLocaleDateString("id-ID", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </div>

                                            {req.status === "pending" && (
                                                <CustomButton
                                                    className="text-white border-none  text-xs px-3 py-1.5 mt-2 sm:mt-0 whitespace-nowrap bg-red-500 hover:bg-red-600"
                                                    onClick={() => handleCancelRequest(req.id)}
                                                    disabled={cancelMutation.isPending}
                                                >
                                                    Batal
                                                </CustomButton>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-zinc-500">
                                    Belum ada permintaan perubahan domain untuk domain ini.
                                    <br />
                                    <button className="text-green-600 hover:underline mt-2 text-sm" onClick={() => setIsModalOpen(true)}>
                                        Ajukan perubahan sekarang →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <RequestDomainModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} currentDomain={domain.domain} branchId={domain.branch?.id ?? null} />
            </div>
        </>
    );
}
