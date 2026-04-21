"use client";

import { useState } from "react";
import { toast, Toaster } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Calendar as CalendarIcon, 
    Target, 
    Dumbbell, 
    CheckCircle2, 
    XCircle,
    AlertCircle,
    Clock,
    CreditCard,
    Zap
} from "lucide-react";
import { 
    usePtPlans, 
    useMyPtPackages, 
    usePurchasePtPackage 
} from "@/hooks/tenant/usePt";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { useQueryClient } from "@tanstack/react-query";

type TabKey = "buy" | "my_packages";

const TABS = [
    { key: "buy" as TabKey, label: "Beli Paket PT" },
    { key: "my_packages" as TabKey, label: "Paket Saya" },
] as const;

// =============================================
// TAB 1: BELI PAKET (BROWSE PLANS)
// =============================================
function BuyPtTab() {
    const queryClient = useQueryClient();
    const { pay } = useMidtransSnap();

    const { data: plansData, isLoading, isError } = usePtPlans();
    const purchaseMutation = usePurchasePtPackage();

    const handlePurchase = (planId: string) => {
        purchaseMutation.mutate(planId, {
            onSuccess: (response) => {
                const resData = response?.data ?? {};
                const snapToken = resData.snap_token ?? null;

                if (snapToken) {
                    pay(snapToken, {
                        onSuccess: () => {
                            toast.success("Pembayaran berhasil!", {
                                description: "Paket PT Anda sudah aktif. Silakan hubungi instruktur untuk jadwal.",
                            });
                            queryClient.invalidateQueries({ queryKey: ["pt", "member-packages"] });
                        },
                        onPending: () => toast.info("Menunggu pembayaran Anda..."),
                        onError: () => toast.error("Pembayaran gagal."),
                        onClose: () => toast.warning("Popup pembayaran ditutup. Anda bisa melanjutkannya di menu Paket Saya."),
                    });
                    return;
                }

                // Fallback jika tidak ada token (misal paket gratis promo)
                toast.success("Berhasil mendapatkan paket PT!");
                queryClient.invalidateQueries({ queryKey: ["pt", "member-packages"] });
            },
            onError: (error: any) => {
                const message = error?.response?.data?.message || "Gagal memproses pembelian paket.";
                toast.error(message);
            },
        });
    };

    const plans = plansData?.data ?? [];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-zinc-100 rounded-2xl animate-pulse border border-zinc-200" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-12 text-center bg-red-50 rounded-2xl border border-red-100 mt-4">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-red-600 font-medium">Gagal memuat katalog paket PT.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan: any) => {
                    const price = parseFloat(plan.price);
                    const isPending = purchaseMutation.isPending && purchaseMutation.variables === plan.id;

                    return (
                        <div key={plan.id} className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all flex flex-col justify-between group relative overflow-hidden">
                            {/* Accent Background */}
                            <div 
                                className="absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"
                                style={{ backgroundColor: plan.color || '#0f766e' }}
                            />

                            <div>
                                <div className="flex justify-between items-start mb-6 relative">
                                    <div 
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner" 
                                        style={{ backgroundColor: `${plan.color || '#0f766e'}15`, color: plan.color || '#0f766e' }}
                                    >
                                        <Target className="w-7 h-7" />
                                    </div>
                                    <span className="px-3 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {plan.category}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-black text-zinc-900 leading-tight mb-2 relative">
                                    {plan.name}
                                </h3>
                                <p className="text-sm text-zinc-500 line-clamp-2 min-h-[40px] mb-6 relative">
                                    {plan.description || "Tingkatkan performa Anda dengan panduan intensif."}
                                </p>

                                <div className="space-y-3 mb-8 relative">
                                    <div className="flex items-center gap-3 text-sm text-zinc-700 font-medium">
                                        <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <span>Total {plan.total_sessions} Sesi</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-700 font-medium">
                                        <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center">
                                            <Clock className="w-4 h-4 text-blue-500" />
                                        </div>
                                        <span>{plan.minutes_per_session} Menit / Sesi</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-700 font-medium">
                                        <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center">
                                            <CalendarIcon className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <span>Masa Aktif {plan.duration} {plan.duration_unit}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-100 relative">
                                <div className="flex items-end gap-1 mb-4">
                                    <span className="text-xs font-bold text-zinc-400 mb-1">Rp</span>
                                    <span className="text-3xl font-black text-zinc-900 tracking-tight">
                                        {price.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <button
                                    onClick={() => handlePurchase(plan.id)}
                                    disabled={isPending}
                                    className="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all bg-zinc-900 hover:bg-teal-600 text-white shadow-lg shadow-zinc-900/20 hover:shadow-teal-500/30"
                                >
                                    {isPending ? "Memproses..." : "Beli Paket Ini"}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// =============================================
// TAB 2: PAKET SAYA (MY PACKAGES)
// =============================================
function MyPackagesTab() {
    const { pay } = useMidtransSnap();
    const { data: packagesData, isLoading, isError } = useMyPtPackages();

    const packages = packagesData?.data ?? [];

    const handleRepay = (invoiceNumber: string) => {
        // Jika butuh get token ulang, panggil API khusus repay. 
        // Untuk saat ini, kita beri toast info.
        toast.info("Silakan buka email Anda atau hubungi admin untuk melanjutkan pembayaran invoice " + invoiceNumber);
    };

    if (isLoading) {
        return (
            <div className="space-y-4 py-4">
                {[1, 2].map((i) => (
                    <div key={i} className="h-32 bg-zinc-100 rounded-2xl animate-pulse border border-zinc-200" />
                ))}
            </div>
        );
    }

    if (isError) {
        return <div className="py-12 text-center text-red-500 mt-4">Gagal memuat daftar paket Anda.</div>;
    }

    if (packages.length === 0) {
        return (
            <div className="py-20 text-center bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed mt-4">
                <Dumbbell className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">Anda belum memiliki paket Personal Training.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-6 space-y-5"
        >
            {packages.map((pkg: any) => {
                const plan = pkg.plan;
                const remaining = pkg.remaining_sessions ?? (pkg.total_sessions - pkg.used_sessions);
                const progressPercentage = (pkg.used_sessions / pkg.total_sessions) * 100;

                const statusColors: Record<string, string> = {
                    active: "bg-teal-100 text-teal-700 border-teal-200",
                    pending: "bg-amber-100 text-amber-700 border-amber-200",
                    completed: "bg-blue-100 text-blue-700 border-blue-200",
                    expired: "bg-zinc-100 text-zinc-500 border-zinc-200",
                    cancelled: "bg-red-100 text-red-700 border-red-200",
                };

                return (
                    <div key={pkg.id} className="bg-white border border-zinc-200 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <h3 className="font-black text-zinc-900 text-xl tracking-tight">
                                    {plan?.name || "Paket PT"}
                                </h3>
                                <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${statusColors[pkg.status] || statusColors.expired}`}>
                                    {pkg.status}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-500 font-medium mb-5">
                                {pkg.status === "pending" ? (
                                    <span className="flex items-center gap-1.5 text-amber-600">
                                        <CreditCard className="w-4 h-4" /> Menunggu Pembayaran
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5">
                                        <CalendarIcon className="w-4 h-4 text-zinc-400" />
                                        Berlaku s/d: {pkg.expired_at ? new Date(pkg.expired_at).toLocaleDateString('id-ID') : '-'}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5">
                                    <Target className="w-4 h-4 text-zinc-400" />
                                    Total {pkg.total_sessions} Sesi
                                </span>
                            </div>

                            {/* Progress Bar Kuota */}
                            <div className="max-w-md">
                                <div className="flex justify-between text-xs font-bold mb-1.5">
                                    <span className="text-zinc-500 uppercase tracking-wider">Terpakai: {pkg.used_sessions}</span>
                                    <span className="text-teal-600 uppercase tracking-wider">Sisa: {remaining}</span>
                                </div>
                                <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${pkg.status === 'active' ? 'bg-teal-500' : 'bg-zinc-400'}`}
                                        style={{ width: `${progressPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="shrink-0 flex items-center justify-end md:border-l md:border-zinc-100 md:pl-6">
                            {pkg.status === "pending" && pkg.invoice?.invoice_number ? (
                                <button
                                    onClick={() => handleRepay(pkg.invoice.invoice_number)}
                                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-amber-500/20"
                                >
                                    Bayar Sekarang
                                </button>
                            ) : pkg.status === "active" ? (
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Status Sesi</p>
                                    <p className="text-sm font-semibold text-zinc-700">Hubungi Pelatih</p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-zinc-400">
                                    {pkg.status === "completed" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    <span className="text-xs font-bold uppercase tracking-widest">{pkg.status}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </motion.div>
    );
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function MemberPtBooking() {
    const [activeTab, setActiveTab] = useState<TabKey>("buy");

    return (
        <div className="font-sans min-h-screen bg-[#FAFAFA] pb-12">
            <Toaster position="top-center" richColors />

            <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8">
                <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col min-h-[700px]">
                    
                    {/* Header */}
                    <div className="p-6 md:p-10 border-b border-zinc-100 bg-white shrink-0 relative overflow-hidden">
                        {/* Decorative Background Icon */}
                        <Target className="absolute -right-10 -bottom-10 w-64 h-64 text-zinc-50 opacity-50 rotate-12" />
                        
                        <div className="flex items-center gap-5 mb-2 relative z-10">
                            <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/20">
                                <Target className="w-7 h-7 text-teal-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tighter uppercase">
                                    Personal <span className="text-teal-500">Training.</span>
                                </h1>
                                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mt-1.5">
                                    Fokus pada target kebugaran Anda bersama ahli.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-6 md:px-10 bg-zinc-50 border-b border-zinc-200 flex gap-8 shrink-0">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`relative py-5 text-xs font-black uppercase tracking-widest transition-colors ${
                                    activeTab === tab.key ? "text-teal-600" : "text-zinc-400 hover:text-zinc-700"
                                }`}
                            >
                                {tab.label}
                                {activeTab === tab.key && (
                                    <motion.div 
                                        layoutId="activePtTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-teal-500 rounded-t-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-10 flex-1 bg-white">
                        <AnimatePresence mode="wait">
                            {activeTab === "buy" && <BuyPtTab key="buy" />}
                            {activeTab === "my_packages" && <MyPackagesTab key="my_packages" />}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}