// app/(tenant)/member/checkin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast, Toaster } from "sonner";
import { RefreshCw, ShieldCheck, AlertCircle, Clock } from "lucide-react";

// Hook React Query yang baru kita buat
import { useMemberMe } from "@/hooks/tenant/useMemberAuth"; 

export default function MemberQRCheckInPage() {
    // Gunakan React Query untuk ambil data, auto-polling, dan status loading
    const { 
        data: member, 
        isLoading, 
        isFetching, 
        refetch, 
        dataUpdatedAt 
    } = useMemberMe();

    // State untuk melacak token sebelumnya (untuk mendeteksi perubahan/sukses scan)
    const [previousToken, setPreviousToken] = useState<string | null>(null);

    // Deteksi jika qr_token berubah (berarti sukses check-in di meja kasir)
    useEffect(() => {
        if (member?.qr_token) {
            if (previousToken && previousToken !== member.qr_token) {
                toast.success("Check-in berhasil! QR Code telah diperbarui.", { duration: 4000 });
            }
            setPreviousToken(member.qr_token);
        }
    }, [member?.qr_token, previousToken]);

    // Tampilan Loading Awal (hanya saat pertama kali buka halaman)
    if (isLoading || !member) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    const activeMembership = member.memberships?.find(m => m.status === 'active');
    const isExpired = activeMembership ? new Date(activeMembership.end_date) < new Date() : true;
    
    // Konversi timestamp React Query ke format Jam
    const lastUpdatedDate = dataUpdatedAt ? new Date(dataUpdatedAt) : new Date();

    return (
        <div className="max-w-md mx-auto py-8 px-4 font-figtree">
            <Toaster position="top-center" />
            
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Check-In</h1>
                <p className="text-zinc-500 mt-2 text-sm">Arahkan kode QR ini ke scanner di meja resepsionis.</p>
            </div>

            {/* KARTU QR CODE UTAMA */}
            <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 shadow-xl shadow-blue-900/5 relative overflow-hidden flex flex-col items-center">
                
                {/* Status Lencana di Atas Card */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-center">
                    {activeMembership && !isExpired ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-widest">
                            <ShieldCheck size={14} /> Keanggotaan Aktif
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-widest">
                            <AlertCircle size={14} /> {activeMembership ? "Paket Expired" : "Belum Ada Paket"}
                        </span>
                    )}
                </div>

                <div className="mt-10 mb-8 p-4 bg-white rounded-3xl shadow-sm border-2 border-zinc-100">
                    {/* Komponen QRCode */}
                    {member.qr_token ? (
                        <QRCodeSVG 
                            value={member.qr_token} 
                            size={240} 
                            level="H" 
                            includeMargin={false}
                            fgColor={isExpired ? "#ef4444" : "#09090b"} 
                        />
                    ) : (
                        <div className="w-[240px] h-[240px] bg-zinc-100 flex flex-col items-center justify-center text-zinc-400 text-sm font-medium rounded-2xl">
                            <AlertCircle size={32} className="mb-2 opacity-50" />
                            QR tidak tersedia
                        </div>
                    )}
                </div>

                {/* Detail Membership */}
                <div className="w-full bg-zinc-50 rounded-2xl p-4 border border-zinc-100 space-y-3 mb-6">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 font-medium">Nama Member</span>
                        <span className="font-bold text-zinc-900">{member.name}</span>
                    </div>
                    {activeMembership && (
                        <>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500 font-medium">Paket</span>
                                <span className="font-bold text-zinc-900">{activeMembership.plan?.name || "Premium Plan"}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-zinc-500 font-medium">Sisa Kuota</span>
                                <span className="font-bold text-blue-600">
                                    {activeMembership.unlimited_checkin ? "Unlimited" : `${activeMembership.remaining_checkin_quota} Visit`}
                                </span>
                            </div>
                        </>
                    )}
                </div>

                {/* Indikator Refresh (Di-handle otomatis oleh React Query isFetching) */}
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                        <Clock size={14} />
                        Diperbarui: {lastUpdatedDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <button 
                        onClick={() => refetch()} 
                        disabled={isFetching}
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
                        {isFetching ? "Memperbarui..." : "Refresh QR"}
                    </button>
                </div>
            </div>
        </div>
    );
}