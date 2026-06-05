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
    Zap,
    User,
    MapPin,
} from "lucide-react";
import { 
    usePtPlans, 
    useMyPtPackages, 
    usePurchasePtPackage,
    useMyPtSessions, 
} from "@/hooks/tenant/usePt";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";
import { useQueryClient } from "@tanstack/react-query";

type TabKey = "buy" | "my_packages" | "my_sessions";

const TABS = [
    { key: "buy" as TabKey, label: "Beli Paket PT" },
    { key: "my_packages" as TabKey, label: "Paket Saya" },
    { key: "my_sessions" as TabKey, label: "Sesi Saya" },
] as const;

// =============================================
// TAB 1: BELI PAKET (BROWSE PLANS)
// =============================================
function BuyPtTab({ setActiveTab }: { setActiveTab: (tab: TabKey) => void }) {
    const queryClient = useQueryClient();
    const { pay } = useMidtransSnap();

    const { data: plansData, isLoading, isError } = usePtPlans();
    const purchaseMutation = usePurchasePtPackage();
    const [confirmingPlan, setConfirmingPlan] = useState<any | null>(null);

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
                            // Delay invalidation to allow Midtrans Webhook to process
                            setTimeout(() => {
                                queryClient.invalidateQueries({ queryKey: ["pt", "member-packages"] });
                            }, 3000);
                            setActiveTab("my_packages");
                        },
                        onPending: () => {
                            toast.info("Menunggu pembayaran Anda...");
                            setActiveTab("my_packages");
                        },
                        onError: () => toast.error("Pembayaran gagal."),
                        onClose: () => {
                            toast.warning("Popup pembayaran ditutup. Anda bisa melanjutkannya di menu Paket Saya.");
                            setActiveTab("my_packages");
                        },
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
    console.log(plans);

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
            {plans.length === 0 ? (
                <div className="py-20 text-center bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed mt-4">
                    <Target className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">Belum ada katalog paket PT yang tersedia.</p>
                </div>
            ) : (
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
                                        onClick={() => setConfirmingPlan(plan)}
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
            )}

            {/* Modal Konfirmasi Pembelian Paket PT */}
            <AnimatePresence>
                {confirmingPlan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-zinc-200"
                        >
                            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-zinc-900">Konfirmasi Pembelian Paket PT</h3>
                                <button 
                                    onClick={() => setConfirmingPlan(null)} 
                                    className="text-zinc-400 hover:text-zinc-600 transition p-1 hover:bg-zinc-100 rounded-lg"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="bg-teal-50 border border-teal-200/50 p-4 rounded-xl space-y-2">
                                    <div className="text-xs text-teal-700 font-bold uppercase tracking-wider">Detail Paket</div>
                                    <div className="text-base font-black text-zinc-900">{confirmingPlan.name}</div>
                                    {confirmingPlan.description && (
                                        <p className="text-xs text-zinc-500 line-clamp-2">
                                            {confirmingPlan.description}
                                        </p>
                                    )}
                                    
                                    <div className="space-y-1.5 pt-2 border-t border-teal-100/50 text-xs text-zinc-600 font-semibold">
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-3.5 h-3.5 text-amber-500 font-bold" />
                                            <span>Total {confirmingPlan.total_sessions} Sesi</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-blue-500 font-bold" />
                                            <span>{confirmingPlan.minutes_per_session} Menit / Sesi</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-3.5 h-3.5 text-emerald-500 font-bold" />
                                            <span>Masa Aktif {confirmingPlan.duration} {confirmingPlan.duration_unit}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl border border-zinc-200/60">
                                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Harga</span>
                                    <span className="text-lg font-black text-zinc-900">
                                        {confirmingPlan.price && parseFloat(confirmingPlan.price) > 0
                                            ? `Rp ${parseFloat(confirmingPlan.price).toLocaleString("id-ID")}`
                                            : "Gratis"}
                                    </span>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setConfirmingPlan(null)}
                                        className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-xs uppercase tracking-wider transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const targetId = confirmingPlan.id;
                                            setConfirmingPlan(null);
                                            handlePurchase(targetId);
                                        }}
                                        className="flex-1 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition shadow-md shadow-teal-500/10"
                                    >
                                        {confirmingPlan.price && parseFloat(confirmingPlan.price) > 0
                                            ? "Lanjut Pembayaran"
                                            : "Konfirmasi Pembelian"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

import RequestSessionModal from "@/components/pages/member/pt/RequestSessionModal";

// =============================================
// TAB 2: PAKET SAYA (MY PACKAGES)
// =============================================
function MyPackagesTab() {
    const { pay } = useMidtransSnap();
    const { data: packagesData, isLoading, isError, refetch, isRefetching } = useMyPtPackages();
    const [requestModalPkgId, setRequestModalPkgId] = useState<string | null>(null);

    const packages = packagesData?.data ?? [];

    const handleRepay = (invoiceNumber: string) => {
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
            <div className="flex justify-end mb-2">
                <button 
                    onClick={() => refetch()} 
                    disabled={isRefetching}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors disabled:opacity-50"
                >
                    {isRefetching ? (
                        <>
                            <div className="w-3 h-3 border-2 border-zinc-400 border-t-zinc-700 rounded-full animate-spin" />
                            Memuat...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                            Refresh Status
                        </>
                    )}
                </button>
            </div>
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
                                <button
                                    onClick={() => setRequestModalPkgId(pkg.id)}
                                    className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md"
                                >
                                    Buat Jadwal
                                </button>
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

            {requestModalPkgId && (
                <RequestSessionModal 
                    packageId={requestModalPkgId} 
                    onClose={() => setRequestModalPkgId(null)} 
                />
            )}
        </motion.div>
    );
}

// =============================================
// TAB 3: SESI SAYA (MY INDIVIDUAL SESSIONS)
// =============================================
function MySessionsTab() {
    const [statusFilter, setStatusFilter] = useState("all");
    const { data, isLoading, isError } = useMyPtSessions(
        statusFilter !== "all" ? { status: statusFilter } : undefined
    );

    const sessions = data?.data ?? [];

    const statusColors: Record<string, string> = {
        requested: "bg-purple-100 text-purple-700",
        scheduled: "bg-blue-100 text-blue-700",
        ongoing: "bg-amber-100 text-amber-700",
        completed: "bg-teal-100 text-teal-700",
        cancelled: "bg-red-100 text-red-700",
        rejected: "bg-red-100 text-red-700",
    };

    const statusIcons: Record<string, React.ReactNode> = {
        requested: <Clock className="w-4 h-4 text-purple-500" />,
        scheduled: <Clock className="w-4 h-4 text-blue-500" />,
        ongoing: <Zap className="w-4 h-4 text-amber-500" />,
        completed: <CheckCircle2 className="w-4 h-4 text-teal-500" />,
        cancelled: <XCircle className="w-4 h-4 text-red-500" />,
        rejected: <XCircle className="w-4 h-4 text-red-500" />,
    };

    if (isLoading) {
        return (
            <div className="space-y-4 py-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-zinc-100 rounded-2xl animate-pulse border border-zinc-200" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="py-12 text-center bg-red-50 rounded-2xl border border-red-100 mt-4">
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-red-600 font-medium">Gagal memuat daftar sesi PT.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="py-4"
        >
            {/* Filter Pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar bg-white p-1 rounded-xl border border-zinc-200 w-max shadow-sm">
                {[
                    { val: "all", label: "Semua" },
                    { val: "requested", label: "Menunggu Acc" },
                    { val: "scheduled", label: "Terjadwal" },
                    { val: "completed", label: "Selesai" },
                    { val: "cancelled", label: "Dibatalkan" },
                    { val: "rejected", label: "Ditolak" },
                ].map((f) => (
                    <button
                        key={f.val}
                        onClick={() => setStatusFilter(f.val)}
                        className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                            statusFilter === f.val
                                ? "bg-teal-500 text-white shadow-sm"
                                : "bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                        }`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {sessions.length === 0 ? (
                <div className="py-20 text-center bg-zinc-50 rounded-3xl border border-zinc-200 border-dashed">
                    <Target className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">Belum ada sesi PT yang dijadwalkan.</p>
                    <p className="text-xs text-zinc-400 mt-1">Sesi PT akan muncul di sini setelah pelatih Anda membuat jadwal.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sessions.map((session: any) => {
                        const planName = session.package?.plan?.name || "Paket PT";
                        const trainerName = session.trainer?.name || "Pelatih";
                        const branchName = session.branch?.name || "";

                        const displayDate = new Date(session.date).toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        });

                        return (
                            <div
                                key={session.id}
                                className="bg-white border border-zinc-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-teal-200 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Date badge */}
                                    <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 shrink-0 text-white shadow-inner">
                                        <span className="text-[10px] text-teal-400 uppercase font-black tracking-widest mb-0.5">
                                            {new Date(session.date).toLocaleDateString("id-ID", { month: "short" })}
                                        </span>
                                        <span className="text-xl font-black leading-none">
                                            {new Date(session.date).getDate()}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-black text-zinc-900 text-lg uppercase tracking-tight">
                                                {planName}
                                            </h3>
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${statusColors[session.status] || "bg-zinc-100 text-zinc-500"}`}>
                                                {session.status}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-zinc-500">
                                            <span className="flex items-center gap-1.5 px-2 py-1 bg-zinc-100 rounded-md text-zinc-800">
                                                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                                                {session.start_at?.slice(0, 5)} - {session.end_at?.slice(0, 5)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-zinc-400" />
                                                {trainerName}
                                            </span>
                                            {branchName && (
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                                                    {branchName}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1.5 md:hidden">
                                                <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
                                                {displayDate}
                                            </span>
                                        </div>

                                        {session.notes && (
                                            <p className="text-xs text-zinc-400 mt-2 italic">
                                                📝 {session.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Status icon */}
                                <div className="shrink-0 flex items-center justify-end md:border-l md:border-zinc-100 md:pl-6">
                                    <div className="flex items-center gap-2">
                                        {statusIcons[session.status] || statusIcons.scheduled}
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                            {session.status === "scheduled" && "Menunggu"}
                                            {session.status === "ongoing" && "Berlangsung"}
                                            {session.status === "completed" && "Selesai"}
                                            {session.status === "cancelled" && "Dibatalkan"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function MemberPtBooking() {
    const [activeTab, setActiveTab] = useState<TabKey>("buy");

    return (
        <div className="space-y-6 font-figtree pb-10 bg-white p-5 rounded-xl border border-gray-500/20">
            <Toaster position="top-center" richColors />

            <div>
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Target size={22} className="text-zinc-700" />
                        <h1 className="text-2xl font-bold text-zinc-900">
                            Personal Training
                        </h1>
                    </div>
                    <p className="text-sm text-zinc-500">
                        Fokus pada target kebugaran Anda bersama ahli.
                    </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-zinc-200 flex gap-6 overflow-x-auto hide-scrollbar shrink-0 mb-6">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative py-3 text-sm font-medium transition-colors whitespace-nowrap ${
                                activeTab === tab.key ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.key && (
                                <motion.div 
                                    layoutId="activePtTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div>
                    <AnimatePresence mode="wait">
                        {activeTab === "buy" && <BuyPtTab key="buy" setActiveTab={setActiveTab} />}
                        {activeTab === "my_packages" && <MyPackagesTab key="my_packages" />}
                        {activeTab === "my_sessions" && <MySessionsTab key="my_sessions" />}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}