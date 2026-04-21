"use client";

import { useMemberAuth } from "@/providers/MemberAuthProvider";
import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import CustomButton from "@/components/ui/button/CustomButton";
import { useUpgradeMembership } from "@/hooks/tenant/useUpgradeMembership"; // Sesuaikan path hook ini
// Asumsi kamu punya hook untuk list katalog membership yang bisa dibeli
import { useAvailableMembershipPlans } from "@/hooks/tenant/useMembershipPlans"; 
import { useMemberMe } from "@/hooks/tenant/useMemberAuth";

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
    // Ambil katalog plan yang tersedia dari backend
    const { data: plansResponse, isLoading } = useAvailableMembershipPlans();
    const upgradeMutation = useUpgradeMembership();

    // Pastikan Midtrans Snap dimuat
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
                onClose(); // Tutup modal pemilihan plan
                if (data.snap_token) {
                    (window as any).snap.pay(data.snap_token, {
                        onSuccess: () => {
                            toast.success(`Pembayaran ${planName} Berhasil! Paket Anda sedang diaktifkan.`);
                            // Idealnya panggil refresh member data di sini
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

    // Filter plan: Jangan tampilkan plan yang saat ini sedang aktif (currentPlanId)
    const availablePlans = (plansResponse || []).filter((p: any) => p.id !== currentPlanId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Pilih Paket Membership</h2>
                        <p className="text-sm text-gray-500">Pilih paket baru untuk menggantikan paket Anda saat ini.</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div></div>
                    ) : availablePlans.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">Tidak ada paket lain yang tersedia saat ini.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {availablePlans.map((plan: any) => (
                                <div key={plan.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col hover:border-blue-300 hover:shadow-md transition">
                                    <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                                    <p className="text-sm text-gray-500 mt-1 mb-4">{plan.description || "Akses fasilitas gym lengkap."}</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-end justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-semibold">Harga</p>
                                            <p className="font-bold text-blue-600 text-lg">
                                                Rp {Number(plan.price).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <CustomButton 
                                            onClick={() => handleUpgrade(plan.id, plan.name)}
                                            disabled={upgradeMutation.isPending}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm shadow-sm"
                                        >
                                            {upgradeMutation.isPending ? "Tunggu..." : "Pilih Paket"}
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
    console.log("Data Member di Profile:", member); // TAMBAHKAN INI

    if (!member) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    const activeMembership = member.active_membership;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 font-figtree">
            <Toaster position="top-center" />
            
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-zinc-900">My Membership</h1>
                <p className="text-zinc-500 mt-1">Pantau status berlangganan dan lakukan upgrade paket Anda di sini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* KIRI: Status Membership Saat Ini */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm relative overflow-hidden">
                        {/* Aksen background agar terlihat seperti kartu premium */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                        
                        <h3 className="font-bold text-zinc-800 mb-6 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                            Status Berlangganan
                        </h3>
                        
                        {activeMembership ? (
                            <div className="space-y-5">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">Paket Aktif</p>
                                    <p className="font-bold text-xl text-blue-700">{activeMembership.plan?.name || "Premium Plan"}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-zinc-500">Mulai Berlaku</p>
                                        <p className="font-medium text-zinc-800 text-sm">
                                            {new Date(activeMembership.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500">Berakhir Pada</p>
                                        <p className="font-medium text-red-600 text-sm">
                                            {activeMembership.end_date 
                                                ? new Date(activeMembership.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                                                : "Lifetime"
                                            }
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-100">
                                    <p className="text-xs text-zinc-500">Cabang Terdaftar</p>
                                    <p className="font-medium text-zinc-800">{member.home_branch?.name || "Global Access"}</p>
                                </div>

                                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 mt-4 font-medium">
                                    Status Anda saat ini <span className="font-bold">AKTIF</span>. Anda bebas mengakses fasilitas gym sesuai ketentuan paket.
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium">Tidak ada paket aktif.</p>
                                <p className="text-xs text-gray-400 mt-1">Silakan beli paket untuk mulai nge-gym!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* KANAN: Aksi & Benefit */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-8 shadow-sm flex flex-col justify-center h-full min-h-[300px]">
                        <div className="max-w-lg mx-auto text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                {activeMembership ? "Ingin Pengalaman Lebih?" : "Mulai Perjalanan Kebugaran Anda!"}
                            </h2>
                            <p className="text-gray-600 mb-8">
                                {activeMembership 
                                    ? "Upgrade paket membership Anda sekarang untuk membuka akses ke fasilitas premium, kelas eksklusif, dan penawaran spesial lainnya. Paket lama Anda akan otomatis digantikan."
                                    : "Pilih paket membership yang sesuai dengan target kebugaran Anda dan nikmati akses penuh ke seluruh fasilitas gym kami."
                                }
                            </p>
                            
                            <CustomButton 
                                onClick={() => setIsUpgradeModalOpen(true)}
                                className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                            >
                                {activeMembership ? "Upgrade Paket Sekarang" : "Beli Membership Baru"}
                            </CustomButton>

                            {activeMembership && (
                                <p className="text-xs text-gray-400 mt-4">
                                    *Catatan: Sisa waktu dari paket lama (jika ada) akan hangus saat paket baru diaktifkan.
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