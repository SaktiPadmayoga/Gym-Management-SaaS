// app/(tenant)/member/checkin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast, Toaster } from "sonner";
import { RefreshCw, ShieldCheck, AlertCircle, Clock, QrCode, User, Award, Calendar, MapPin } from "lucide-react";
import { useMemberAuth } from "@/providers/MemberAuthProvider";
import { useMemberMe } from "@/hooks/tenant/useMemberAuth";
import { useMemberDashboard } from "@/hooks/tenant/useMemberDashboard";

export default function MemberQRCheckInPage() {
    const { member } = useMemberAuth();
    const { data: profile } = useMemberMe();

    // Fetch data dashboard untuk riwayat check-in
    const { data: dashboardData, isLoading: isDashboardLoading, refetch: refetchDashboard } = useMemberDashboard();

    const [previousToken, setPreviousToken] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdatedDate, setLastUpdatedDate] = useState<Date>(new Date());

    useEffect(() => {
        if (member?.qr_token) {
            if (previousToken && previousToken !== member.qr_token) {
                toast.success("Check-in berhasil! QR Code telah diperbarui.", { duration: 4000 });
                refetchDashboard();
            }
            setPreviousToken(member.qr_token);
        }
    }, [member?.qr_token, previousToken, refetchDashboard]);

    if (!member) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent" />
            </div>
        );
    }

    const activeMembership = member.active_membership;
    const isExpired = activeMembership ? new Date(activeMembership.end_date) < new Date() : true;

    const handleRefresh = () => {
        setIsRefreshing(true);
        refetchDashboard();
        setTimeout(() => {
            setLastUpdatedDate(new Date());
            setIsRefreshing(false);
        }, 500);
    };

    return (
        <div className=" font-figtree bg-white p-6 rounded-2xl border border-zinc-200 w-full mx-auto">
            <Toaster position="top-center" />

            {/* Inline keyframe animation for the scan line */}
            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .scan-line {
                    animation: scan 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
            `}</style>

            <div className="text-center md:text-left">
                <h1 className="text-2xl font-black text-zinc-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
                    <QrCode className="w-7 h-7 text-teal-600" />
                    Check-In & Riwayat Kunjungan
                </h1>
                <p className="text-zinc-500 mt-1 text-xs leading-relaxed">Pindai kode QR untuk masuk ke gym, dan pantau riwayat kunjungan terbaru Anda secara berdampingan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mt-4">
                {/* --- KOLOM KIRI: KARTU QR CODE CHECKIN --- */}
                <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xl shadow-zinc-200/40 relative overflow-hidden flex flex-col items-center">
                    {/* Status Lencana */}
                    <div className="w-full flex justify-center mb-6">
                        {profile?.active_membership && !isExpired ? (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-md uppercase tracking-wider border border-emerald-100 shadow-xs">
                                <ShieldCheck size={14} className="animate-pulse" />
                                Akses Aktif
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-red-50 text-red-700 text-[10px] font-black rounded-md uppercase tracking-wider border border-red-100 shadow-xs">
                                <AlertCircle size={14} />
                                {profile?.active_membership ? "Akses Expired" : "Tidak Ada Paket"}
                            </span>
                        )}
                    </div>

                    {/* Container QR Code dengan Animasi Scan Line */}
                    <div className="relative p-6 bg-zinc-50 border-2 border-zinc-200/65 rounded-3xl shadow-inner mb-6 overflow-hidden group">
                        {/* Corner Borders for Scanner Effect */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-zinc-400 rounded-tl-sm group-hover:border-teal-500 transition-colors" />
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-zinc-400 rounded-tr-sm group-hover:border-teal-500 transition-colors" />
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-zinc-400 rounded-bl-sm group-hover:border-teal-500 transition-colors" />
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-zinc-400 rounded-br-sm group-hover:border-teal-500 transition-colors" />

                        {/* Scan Line */}
                        {member.qr_token && <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent shadow-[0_0_8px_#00b7b5] scan-line" />}

                        {member.qr_token ? (
                            <QRCodeSVG value={member.qr_token} size={200} level="H" includeMargin={false} fgColor={isExpired ? "#ef4444" : "#0d766e"} className="transition-colors duration-500" />
                        ) : (
                            <div className="w-[200px] h-[200px] bg-zinc-100 flex flex-col items-center justify-center text-zinc-400 text-xs font-bold rounded-2xl">
                                <AlertCircle size={32} className="mb-2 opacity-50 text-red-500" />
                                QR tidak tersedia
                            </div>
                        )}
                    </div>

                    {/* Detail Membership bergaya ID Card */}
                    <div className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 space-y-3 mb-6 relative">
                        <div className="absolute top-0 right-4 w-12 h-3 bg-zinc-200/60 rounded-b-md flex justify-center items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        </div>

                        <div className="flex items-center gap-3 pb-2 border-b border-zinc-200/60">
                            <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 flex-shrink-0">
                                <User size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-wider">Nama Member</p>
                                <p className="font-extrabold text-zinc-900 text-sm truncate leading-tight">{profile?.name}</p>
                            </div>
                        </div>

                        {profile?.active_membership && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-start gap-2">
                                    <Award size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-wider">Paket</p>
                                        <p className="font-bold text-zinc-900 text-xs leading-tight">{profile.active_membership.plan?.name || "Premium Plan"}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <Calendar size={16} className="text-teal-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-wider">Sisa Kuota</p>
                                        <p className="font-bold text-teal-700 text-xs leading-tight">{profile.active_membership.unlimited_checkin ? "Unlimited" : `${profile.active_membership.remaining_checkin_quota} Visit`}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Refresh Indicator */}
                    <div className="flex items-center justify-between w-full pt-2 border-t border-zinc-100">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                            <Clock size={12} />
                            Update: {lastUpdatedDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-teal-600 hover:text-teal-800 transition-colors disabled:opacity-50 hover:cursor-pointer"
                        >
                            <RefreshCw size={12} className={isRefreshing ? "animate-spin" : ""} />
                            {isRefreshing ? "Refreshing" : "Refresh QR"}
                        </button>
                    </div>
                </div>

                {/* --- KOLOM KANAN: RIWAYAT KUNJUNGAN --- */}
                <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xl shadow-zinc-200/40 h-full min-h-[460px]">
                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-zinc-100">
                        <Clock className="w-5 h-5 text-teal-600" />
                        <h2 className="text-lg font-black text-zinc-900 tracking-tight">Riwayat Kunjungan Terbaru</h2>
                    </div>

                    {isDashboardLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3">
                            <div className="animate-spin h-6 w-6 border-2 border-teal-600 border-t-transparent rounded-full" />
                            <span className="text-xs font-bold text-zinc-400">Memuat riwayat kunjungan...</span>
                        </div>
                    ) : !dashboardData?.recent_checkins || dashboardData.recent_checkins.length === 0 ? (
                        <div className="text-center py-24 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                            <AlertCircle className="w-10 h-10 text-zinc-400 mx-auto mb-2 opacity-50" />
                            <p className="text-zinc-500 font-bold text-sm">Belum Ada Kunjungan</p>
                            <p className="text-xs text-zinc-400 mt-1">Riwayat check-in Anda akan muncul di sini setelah scan berhasil.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {dashboardData.recent_checkins.map((checkin) => (
                                <div key={checkin.id} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-200/60 rounded-2xl hover:border-teal-300 hover:bg-teal-50/10 transition-all duration-300 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <p className="font-extrabold text-zinc-900 text-sm">{checkin.branch_name || "Cabang Utama"}</p>
                                            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Berhasil Check-In
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-zinc-700">{new Date(checkin.checked_in_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">{new Date(checkin.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
