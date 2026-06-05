"use client";

import { useMemberAuth } from "@/providers/MemberAuthProvider";
import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import CustomButton from "@/components/ui/button/CustomButton";
import { useUpgradeMembership } from "@/hooks/tenant/useUpgradeMembership";
import { useAvailableMembershipPlans } from "@/hooks/tenant/useMembershipPlans"; 
import { useMemberMe } from "@/hooks/tenant/useMemberAuth";
import { Sparkles, Shield, Calendar, CheckCircle2, AlertTriangle, CreditCard, ChevronRight, X, ArrowRight, MapPin, Award } from "lucide-react";

// --- MODAL COMPONENT ---
const UpgradeMembershipModal = ({ 
    isOpen, 
    onClose, 
    currentPlanId 
}: { 
    isOpen: boolean, 
    onClose: () => void,
    currentPlanId?: string 
}) => {
    const { data: plansResponse, isLoading } = useAvailableMembershipPlans();
    const upgradeMutation = useUpgradeMembership();

    useEffect(() => {
        if (!isOpen) return;
        const snapScript = "https://app.sandbox.midtrans.com/snap/snap.js";
        const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
        if (!document.querySelector(`script[src="${snapScript}"]`)) {
            const script = document.createElement("script");
            script.src = snapScript;
            script.setAttribute("data-client-key", clientKey);
            script.async = true;
            document.body.appendChild(script);
        }
    }, [isOpen]);

    const handleUpgrade = (planId: string, planName: string) => {
        upgradeMutation.mutate(planId, {
            onSuccess: (data) => {
                onClose();
                if (data.snap_token) {
                    (window as any).snap.pay(data.snap_token, {
                        onSuccess: () => {
                            toast.success(`Pembayaran ${planName} Berhasil! Paket Anda sedang diaktifkan.`);
                            setTimeout(() => window.location.reload(), 2000);
                        },
                        onPending: () => toast.info("Menunggu pembayaran diselesaikan."),
                        onError: () => toast.error("Pembayaran gagal."),
                        onClose: () => toast.warning("Anda menutup popup sebelum membayar.")
                    });
                }
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || "Gagal memproses permintaan upgrade.");
            }
        });
    };

    if (!isOpen) return null;

    const availablePlans = (plansResponse || []).filter((p: any) => p.id !== currentPlanId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-zinc-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-gradient-to-r from-zinc-50 to-white">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-teal-600 animate-pulse" />
                            Pilih Paket Membership Baru
                        </h2>
                        <p className="text-xs text-zinc-500 mt-0.5">Pilih paket terbaik untuk perjalanan latihan Anda.</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors focus:outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-zinc-50/50">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full"></div>
                            <span className="text-xs font-bold text-zinc-400">Memuat paket pilihan...</span>
                        </div>
                    ) : availablePlans.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200">
                            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3 opacity-60" />
                            <p className="text-zinc-600 font-bold text-sm">Tidak Ada Paket Tersedia</p>
                            <p className="text-xs text-zinc-400 mt-1">Semua pilihan paket saat ini sudah tidak aktif atau sudah Anda beli.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {availablePlans.map((plan: any) => (
                                <div 
                                    key={plan.id} 
                                    className="bg-white border border-zinc-200 rounded-2xl p-6 flex flex-col hover:border-teal-500 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-300 transform hover:-translate-y-0.5 group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-extrabold text-zinc-900 text-lg group-hover:text-teal-700 transition-colors">{plan.name}</h3>
                                        {plan.unlimited_checkin && (
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-md">
                                                Unlimited
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                                        {plan.description || "Dapatkan akses penuh ke seluruh fasilitas gym premium dan alat latihan terkini."}
                                    </p>
                                    
                                    <div className="mt-auto pt-5 border-t border-zinc-100 flex items-end justify-between">
                                        <div>
                                            <p className="text-[9px] text-zinc-400 uppercase font-black tracking-widest mb-0.5">Biaya Paket</p>
                                            <p className="font-black text-zinc-900 text-xl tracking-tight">
                                                Rp {Number(plan.price).toLocaleString('id-ID')}
                                                <span className="text-[10px] text-zinc-400 font-normal"> / {plan.duration} {plan.duration_unit === 'month' ? 'bln' : plan.duration_unit === 'day' ? 'hari' : plan.duration_unit}</span>
                                            </p>
                                        </div>
                                        <CustomButton 
                                            onClick={() => handleUpgrade(plan.id, plan.name)}
                                            disabled={upgradeMutation.isPending}
                                            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold shadow-sm rounded-xl transition-all"
                                        >
                                            {upgradeMutation.isPending ? "Tunggu..." : "Pilih"}
                                        </CustomButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
export default function MemberMembership() {
    const { data: member } = useMemberMe();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    if (!member) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent" />
            </div>
        );
    }

    const activeMembership = member.active_membership;
    const isExpired = activeMembership ? new Date(activeMembership.end_date) < new Date() : true;

    return (
        <div className="space-y-6 font-figtree pb-10 bg-white p-6 rounded-2xl border border-zinc-200">
            <Toaster position="top-center" />
            
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
                    <Award className="w-7 h-7 text-teal-600" />
                    Status Keanggotaan
                </h1>
                <p className="text-sm text-zinc-500 mt-1">Kelola dan pantau status aktif langganan gym Anda dengan mudah.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* KIRI: Status Membership Saat Ini */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-b from-zinc-900 via-zinc-800 to-zinc-950 rounded-3xl p-6 shadow-xl shadow-zinc-900/10 text-white relative overflow-hidden h-full flex flex-col justify-between min-h-[350px]">
                        
                        {/* Decorative background glow */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl" />
                        
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white/10 px-2.5 py-1 rounded-md border border-white/5">
                                    GymFit Member
                                </span>
                                {activeMembership && !isExpired ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-md">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping mr-0.5" />
                                        Aktif
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded-md">
                                        Expired
                                    </span>
                                )}
                            </div>

                            {activeMembership ? (
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Paket yang Diikuti</p>
                                        <p className="font-extrabold text-2xl text-teal-300 tracking-tight">
                                            {activeMembership.plan?.name || "Premium Plan"}
                                        </p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mb-1">Mulai Berlaku</p>
                                            <p className="font-bold text-sm text-zinc-200">
                                                {new Date(activeMembership.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mb-1">Berakhir Pada</p>
                                            <p className={`font-bold text-sm ${isExpired ? 'text-red-400' : 'text-zinc-200'}`}>
                                                {activeMembership.end_date 
                                                    ? new Date(activeMembership.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                    : "Lifetime"
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-zinc-300 text-sm">
                                            <MapPin size={16} className="text-teal-400 flex-shrink-0" />
                                            <span>Home Cabang: <strong>{member.home_branch?.name || "Global Access"}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <div className="bg-white/5 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                                        <AlertTriangle className="w-7 h-7 text-zinc-400" />
                                    </div>
                                    <p className="text-zinc-300 font-bold text-sm">Tidak Ada Paket Aktif</p>
                                    <p className="text-xs text-zinc-500 mt-1">Silakan membeli paket keanggotaan baru untuk mulai beraktivitas.</p>
                                </div>
                            )}
                        </div>

                        {activeMembership && !isExpired && (
                            <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-zinc-300 leading-relaxed font-medium">
                                Selalu tunjukkan QR Code pada menu Check-In untuk memvalidasi akses kunjungan harian Anda di gym.
                            </div>
                        )}
                    </div>
                </div>

                {/* KANAN: Aksi & Benefit */}
                <div className="lg:col-span-2">
                    <div className="bg-zinc-50 rounded-3xl border border-zinc-200 p-8 flex flex-col justify-center h-full min-h-[350px] relative overflow-hidden">
                        <div className="max-w-lg mx-auto text-center z-10">
                            <div className="w-14 h-14 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-5 border border-teal-100">
                                <Shield className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-black text-zinc-900 tracking-tight mb-3">
                                {activeMembership ? "Optimalkan Latihan Anda!" : "Pilih Paket Terbaik!"}
                            </h2>
                            <p className="text-zinc-600 text-sm leading-relaxed mb-8">
                                {activeMembership 
                                    ? "Ingin mengganti atau menambah masa berlaku paket? Lakukan upgrade membership ke paket premium kami untuk menikmati keuntungan ekstra, sesi pelatih personal (PT), dan kelas eksklusif."
                                    : "Beli paket membership pilihan Anda untuk mendapatkan akses eksklusif ke seluruh fasilitas gym kami, peralatan latihan modern, loker, dan instruktur berpengalaman."
                                }
                            </p>
                            
                            <CustomButton 
                                onClick={() => setIsUpgradeModalOpen(true)}
                                className="px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2 hover:cursor-pointer"
                            >
                                <CreditCard size={18} />
                                {activeMembership ? "Upgrade / Perpanjang Paket" : "Pilih & Beli Paket"}
                            </CustomButton>

                            {activeMembership && (
                                <p className="text-[10px] text-zinc-400 mt-4 leading-relaxed">
                                    *Catatan: Pembelian paket baru akan menggantikan paket aktif Anda saat ini di database.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Render Modal */}
            <UpgradeMembershipModal 
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                currentPlanId={activeMembership?.plan?.id}
            />
        </div>
    );
}