"use client";

import React, { useState } from "react";
import { toast, Toaster } from "sonner";
import { usePtSessionRequests, useApprovePtRequest, useRejectPtRequest } from "@/hooks/tenant/usePtSessions";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { useRouter } from "next/navigation";

export default function PtRequestsPage() {
    const { staff, selectedBranch } = useStaffAuth();
    const router = useRouter();

    const role = staff?.role;
    const branchRole = selectedBranch?.role;

    // Hanya trainer atau manager/owner yang bisa melihat halaman ini
    if (role !== 'owner' && role !== 'admin' && role !== 'trainer' && branchRole !== 'trainer' && branchRole !== 'branch_manager') {
        return (
            <div className="p-8 text-center text-zinc-500">
                Anda tidak memiliki akses ke halaman ini.
            </div>
        );
    }

    const { data: requestsData, isLoading, refetch } = usePtSessionRequests();
    const { mutateAsync: approveRequest, isPending: isApproving } = useApprovePtRequest();
    const { mutateAsync: rejectRequest, isPending: isRejecting } = useRejectPtRequest();

    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");

    const requests = requestsData?.data || [];

    const handleApprove = async (id: string) => {
        try {
            await approveRequest(id);
            toast.success("Request berhasil disetujui dan dijadwalkan.");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menyetujui request.");
        }
    };

    const handleReject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectId || !rejectReason) return;

        try {
            await rejectRequest({ id: rejectId, reason: rejectReason });
            toast.success("Request berhasil ditolak.");
            setRejectId(null);
            setRejectReason("");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Gagal menolak request.");
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6">
            <Toaster position="top-right" richColors />
            
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Request Jadwal PT</h1>
                    <p className="text-sm text-zinc-500 mt-1">Kelola permintaan jadwal sesi Personal Training dari member.</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm font-bold transition-colors"
                >
                    Refresh
                </button>
            </div>

            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-zinc-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : requests.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
                    <Clock className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">Belum ada request jadwal baru.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req: any) => (
                        <div key={req.id} className="bg-white border border-zinc-200 rounded-2xl p-5 flex flex-col md:flex-row justify-between gap-6 shadow-sm">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-[10px] font-black uppercase tracking-widest">
                                        Menunggu Acc
                                    </span>
                                    <span className="text-xs font-semibold text-zinc-500">
                                        Paket: {req.package?.plan?.name || "PT Package"}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-zinc-900">{req.member?.name}</h3>
                                <p className="text-sm text-zinc-600 mt-1 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    {dayjs(req.date).locale("id").format("dddd, D MMM YYYY")} • {req.start_at.substring(0, 5)} - {req.end_at.substring(0, 5)}
                                </p>
                                {req.notes && (
                                    <p className="text-sm text-zinc-500 mt-3 p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                        <span className="font-semibold block mb-1">Catatan Member:</span>
                                        {req.notes}
                                    </p>
                                )}
                            </div>
                            
                            <div className="shrink-0 flex items-center gap-3 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6">
                                <button
                                    onClick={() => handleApprove(req.id)}
                                    disabled={isApproving || isRejecting}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                                >
                                    <CheckCircle2 className="w-4 h-4" /> Terima
                                </button>
                                <button
                                    onClick={() => setRejectId(req.id)}
                                    disabled={isApproving || isRejecting}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                                >
                                    <XCircle className="w-4 h-4" /> Tolak
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Tolak Request */}
            {rejectId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl">
                        <div className="p-4 border-b">
                            <h3 className="font-bold text-lg text-zinc-900">Tolak Request</h3>
                        </div>
                        <form onSubmit={handleReject} className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1.5 text-zinc-700">Alasan Penolakan</label>
                                <textarea
                                    required
                                    className="w-full p-3 border border-zinc-200 rounded-xl text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                    placeholder="Contoh: Jadwal bentrok, silakan pilih jam lain..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setRejectId(null); setRejectReason(""); }}
                                    className="flex-1 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm font-bold transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isRejecting}
                                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                                >
                                    {isRejecting ? "Menyimpan..." : "Kirim Penolakan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
