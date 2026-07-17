"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { useCurrentSubscription, usePlansForUpgrade } from "@/hooks/useSubscriptionTenant";
import { useCreatePaymentToken } from "@/hooks/usePayments";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";

interface Plan {
    id: string;
    name: string;
    code: string;
    pricing?: {
        monthly?: number;
        yearly?: number;
        currency?: string;
    };
    limits?: {
        max_branches?: number;
        max_membership?: number;
    };
    features?: string[];
}

/* =====================================
 * BILLING TOGGLE (Ukurannya Diperkecil)
 * ===================================== */
function BillingToggle({ value, onChange }: { value: "monthly" | "yearly"; onChange: (v: "monthly" | "yearly") => void }) {
    return (
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-xl border border-zinc-200/50">
            <button type="button" onClick={() => onChange("monthly")} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${value === "monthly" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>
                Bulanan
            </button>
            <button
                type="button"
                onClick={() => onChange("yearly")}
                className={`relative px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${value === "yearly" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
            >
                Tahunan
                <span className="absolute -top-1.5 -right-2 bg-green-500 text-white text-[8px] px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">Hemat 20%</span>
            </button>
        </div>
    );
}

/* =====================================
 * PLAN CARD (Padding, Gap, dan Teks Diperkecil)
 * ===================================== */
function PlanCard({ plan, billing, isCurrentPlan, isProcessing, onSelect }: { plan: Plan; billing: "monthly" | "yearly"; isCurrentPlan: boolean; isProcessing: boolean; onSelect: (plan: Plan) => void }) {
    const price = billing === "yearly" ? plan.pricing?.yearly : plan.pricing?.monthly;
    const maxBranches = plan.limits?.max_branches;
    const isPopular = plan.code === "PREMIUM" || plan.code === "PRO";

    const formatPrice = (p?: number | null) => {
        if (!p) return "Gratis";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: plan.pricing?.currency ?? "IDR",
            maximumFractionDigits: 0,
        }).format(p);
    };

    return (
        <div className={`relative flex flex-col rounded-[24px] p-1 transition-all duration-500 ${isPopular ? "bg-gradient-to-b from-aksen-secondary to-zinc-200 shadow-xl shadow-aksen-secondary/10" : "bg-zinc-200"}`}>
            <div className={`flex flex-col h-full rounded-[20px] p-5 md:p-6 bg-white ${isCurrentPlan ? "bg-zinc-50/50" : ""}`}>
                
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900">{plan.name}</h3>
                        {isCurrentPlan && (
                            <span className="inline-flex items-center gap-1.5 mt-1 text-[9px] font-black text-aksen-secondary uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-aksen-secondary animate-pulse" />
                                Paket Aktif Anda
                            </span>
                        )}
                    </div>
                    {isPopular && !isCurrentPlan && <span className="bg-aksen-secondary text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-aksen-secondary/20">Populer</span>}
                </div>

                <div className="pb-4 mb-4 border-b border-zinc-100">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">{formatPrice(price)}</span>
                        {price ? <span className="text-zinc-400 font-medium text-xs">/{billing === "yearly" ? "thn" : "bln"}</span> : null}
                    </div>
                    {billing === "yearly" && plan.pricing?.monthly && plan.pricing?.yearly && <p className="text-[10px] text-green-600 mt-1 font-medium">Hemat {formatPrice(plan.pricing.monthly * 12 - plan.pricing.yearly)} dibanding bulanan</p>}
                </div>

                <div className="flex flex-col gap-3 mb-6 flex-1">
                    <ul className="space-y-2.5">
                        {/* Member Limit */}
                        <li className="flex items-center gap-2.5 text-xs font-bold text-zinc-800">
                            <div className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            {plan.limits?.max_membership === 0 || !plan.limits?.max_membership 
                              ? "Member Tanpa Batas" 
                              : `Maks. ${plan.limits?.max_membership.toLocaleString("id-ID")} Member`}
                        </li>
                        {/* Branch Limit */}
                        <li className="flex items-center gap-2.5 text-xs font-bold text-zinc-800">
                            <div className="w-4 h-4 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            {maxBranches === 0 || !maxBranches ? "Cabang Tanpa Batas" : `Maks. ${maxBranches.toLocaleString("id-ID")} Cabang`}
                        </li>
                        {/* Dummy/Static Features */}
                        {["Semua fitur", "Custom branding", "Priority support"].map((feature, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-xs text-zinc-500 font-medium">
                                <div className="w-4 h-4 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200 flex-shrink-0">
                                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <button
                    disabled={isCurrentPlan || isProcessing}
                    onClick={() => onSelect(plan)}
                    className={`w-full py-3 rounded-xl text-[10px] md:text-xs font-black transition-all active:scale-95 uppercase tracking-widest ${
                        isCurrentPlan
                             ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                            : isProcessing
                            ? "bg-zinc-200 text-zinc-400 cursor-wait"
                            : isPopular
                            ? "bg-aksen-secondary text-white shadow-md shadow-aksen-secondary/30 hover:shadow-aksen-secondary/50"
                            : "bg-zinc-900 text-white hover:bg-black"
                    }`}
                >
                    {isCurrentPlan ? "Paket Aktif Anda" : isProcessing ? "Memproses..." : "Pilih Paket"}
                </button>
            </div>
        </div>
    );
}

/* =====================================
 * MAIN PAGE AS MODAL
 * ===================================== */
export default function PlansModal() {
    const router = useRouter();
    const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
    const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

    const { data: current } = useCurrentSubscription();
    const { data: plans, isLoading } = usePlansForUpgrade();
    const createTokenMutation = useCreatePaymentToken();
    const { pay } = useMidtransSnap();

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const handleClose = () => router.push("/owner/subscription");

    const handleSelectPlan = async (plan: Plan) => {
        setProcessingPlanId(plan.id);

        try {
            const result = await createTokenMutation.mutateAsync({
                plan_id: plan.id,
                billing_cycle: billing,
            });

            pay(result.snap_token, {
                onSuccess: () => {
                    router.push(`/owner/subscription?success=true`);
                },
                onPending: () => {
                    router.push("/owner/subscription?pending=true");
                },
                onError: () => {
                    router.push("/owner/subscription?failed=true");
                },
                onClose: () => {
                    router.push("/owner/subscription?pending=true");
                },
            });
        } catch (err) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Gagal memproses pembayaran";
            toast.error(message);
            setProcessingPlanId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 font-figtree">
            <Toaster position="top-center" />

            {/* Backdrop */}
            <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300" onClick={handleClose} />

            {/* Modal Container */}
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-zinc-50 rounded-[28px] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out no-scrollbar px-20">
                
                {/* Close Button */}
                <button onClick={handleClose} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-zinc-200 transition-colors z-20">
                    <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-6 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="inline-block px-3 py-1 mb-3 rounded-full bg-aksen-secondary/10 text-aksen-secondary text-[10px] font-black uppercase tracking-[0.2em]">Pilihan Paket</div>
                        <h1 className="text-2xl md:text-3xl font-black text-zinc-900 mb-2 tracking-tight">Tingkatkan Paket Anda</h1>
                        <p className="text-zinc-500 text-sm max-w-md mb-6">Bergabunglah dengan ribuan bisnis yang berkembang bersama platform kami. Pilih paket terbaik untuk kebutuhan Anda.</p>
                        <BillingToggle value={billing} onChange={setBilling} />
                    </div>

                    {/* Plans Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-[400px] bg-zinc-200/50 rounded-[24px] animate-pulse" />
                            ))}
                        </div>
                    ) : !plans || plans.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400 text-sm">Paket tidak tersedia.</div>
                    ) : (
                        <div className={`grid gap-5 ${plans.length === 1 ? "max-w-sm mx-auto" : plans.length === 2 ? "max-w-3xl mx-auto md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
                            {plans.map((plan: Plan) => (
                                <PlanCard key={plan.id} plan={plan} billing={billing} isCurrentPlan={current?.plan_id === plan.id} isProcessing={processingPlanId === plan.id} onSelect={handleSelectPlan} />
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 text-center pb-2">
                        <p className="text-xs text-zinc-400">
                            Butuh paket kustom untuk lebih dari 50 cabang? <span className="text-aksen-secondary font-bold cursor-pointer hover:underline">Hubungi Tim Penjualan</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}