"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { useCurrentSubscription, usePlansForUpgrade } from "@/hooks/useSubscriptionTenant";
import { useCreatePaymentToken } from "@/hooks/usePayments";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";

/* =====================================
 * BILLING TOGGLE
 * ===================================== */
function BillingToggle({ value, onChange }: { value: "monthly" | "yearly"; onChange: (v: "monthly" | "yearly") => void }) {
    return (
        <div className="flex items-center gap-4 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200/50">
            <button type="button" onClick={() => onChange("monthly")} className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${value === "monthly" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}>
                Monthly
            </button>
            <button
                type="button"
                onClick={() => onChange("yearly")}
                className={`relative px-4 py-2 text-sm font-bold rounded-xl transition-all ${value === "yearly" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
            >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">-20%</span>
            </button>
        </div>
    );
}

/* =====================================
 * PLAN CARD
 * ===================================== */
function PlanCard({ plan, billing, isCurrentPlan, isProcessing, onSelect }: { plan: any; billing: "monthly" | "yearly"; isCurrentPlan: boolean; isProcessing: boolean; onSelect: (plan: any) => void }) {
    const price = billing === "yearly" ? plan.pricing?.yearly : plan.pricing?.monthly;
    const maxBranches = plan.limits?.max_branches;
    const isPopular = plan.code === "PREMIUM" || plan.code === "PRO";

    const formatPrice = (p?: number | null) => {
        if (!p) return "Free";
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: plan.pricing?.currency ?? "IDR",
            maximumFractionDigits: 0,
        }).format(p);
    };

    return (
        <div className={`relative flex flex-col rounded-[28px] p-1.5 transition-all duration-500 ${isPopular ? "bg-gradient-to-b from-aksen-secondary to-zinc-200 shadow-xl shadow-aksen-secondary/10" : "bg-zinc-200"}`}>
            <div className={`flex flex-col h-full rounded-[24px] p-8 bg-white ${isCurrentPlan ? "bg-zinc-50/50" : ""}`}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-zinc-900">{plan.name}</h3>
                        {isCurrentPlan && (
                            <span className="inline-flex items-center gap-1.5 mt-1 text-[10px] font-black text-aksen-secondary uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-aksen-secondary animate-pulse" />
                                Current Plan
                            </span>
                        )}
                    </div>
                    {isPopular && !isCurrentPlan && <span className="bg-aksen-secondary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-aksen-secondary/20">Popular</span>}
                </div>

                <div className="pb-6 mb-6 border-b border-zinc-100">
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-zinc-900 tracking-tight">{formatPrice(price)}</span>
                        {price ? <span className="text-zinc-400 font-medium text-sm">/{billing === "yearly" ? "yr" : "mo"}</span> : null}
                    </div>
                    {billing === "yearly" && plan.pricing?.monthly && plan.pricing?.yearly && <p className="text-xs text-green-600 mt-1.5 font-medium">Save {formatPrice(plan.pricing.monthly * 12 - plan.pricing.yearly)} vs monthly</p>}
                </div>

                <div className="flex flex-col gap-4 mb-8 flex-1">
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-sm font-bold text-zinc-800">
                            <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            {maxBranches === 0 || !maxBranches ? "Unlimited Outlets" : `${maxBranches} Outlets`}
                        </li>
                        {Array.isArray(plan.features) &&
                            plan.features.map((feature: string, i: number) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                                    <div className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200 flex-shrink-0">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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
                    className={`w-full py-4 rounded-2xl text-xs font-black transition-all active:scale-95 uppercase tracking-widest ${
                        isCurrentPlan
                            ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                            : isProcessing
                            ? "bg-zinc-200 text-zinc-400 cursor-wait"
                            : isPopular
                            ? "bg-aksen-secondary text-white shadow-lg shadow-aksen-secondary/30 hover:shadow-aksen-secondary/50"
                            : "bg-zinc-900 text-white hover:bg-black"
                    }`}
                >
                    {isCurrentPlan ? "Your Active Plan" : isProcessing ? "Processing..." : "Choose Plan"}
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

    const handleSelectPlan = async (plan: any) => {
        setProcessingPlanId(plan.id);

        try {
            const result = await createTokenMutation.mutateAsync({
                plan_id: plan.id,
                billing_cycle: billing,
            });

            pay(result.snap_token, {
                onSuccess: () => {
                    toast.success("Payment successful!");
                    router.push(`/owner/subscription/success?order_id=${result.order_id}`);
                },
                onPending: () => {
                    toast.info("Payment pending — please complete your payment");
                    router.push("/owner/subscription");
                },
                onError: () => {
                    toast.error("Payment failed, please try again");
                    setProcessingPlanId(null);
                },
                onClose: () => {
                    toast.info("Payment window closed");
                    setProcessingPlanId(null);
                },
            });
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to initiate payment";
            toast.error(message);
            setProcessingPlanId(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-6 font-figtree">
            <Toaster position="top-center" />

            {/* Backdrop */}
            <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300" onClick={handleClose} />

            {/* Modal */}
            <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-zinc-50 rounded-[32px] shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out no-scrollbar">
                {/* Close Button */}
                <button onClick={handleClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-200 transition-colors z-20">
                    <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="p-8 md:p-12">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-12">
                        <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-aksen-secondary/10 text-aksen-secondary text-[11px] font-black uppercase tracking-[0.2em]">Pricing Plans</div>
                        <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4 tracking-tight">Upgrade your experience</h1>
                        <p className="text-zinc-500 text-base max-w-lg mb-8">Join thousands of businesses growing with our platform. Choose the best plan for your needs.</p>
                        <BillingToggle value={billing} onChange={setBilling} />
                    </div>

                    {/* Plans Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-[500px] bg-zinc-200/50 rounded-[28px] animate-pulse" />
                            ))}
                        </div>
                    ) : !plans || plans.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400">No plans available.</div>
                    ) : (
                        <div className={`grid gap-8 ${plans.length === 1 ? "max-w-md mx-auto" : plans.length === 2 ? "max-w-4xl mx-auto md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
                            {plans.map((plan: any) => (
                                <PlanCard key={plan.id} plan={plan} billing={billing} isCurrentPlan={current?.plan_id === plan.id} isProcessing={processingPlanId === plan.id} onSelect={handleSelectPlan} />
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-12 text-center pb-4">
                        <p className="text-sm text-zinc-400">
                            Need a custom plan for more than 50 outlets? <span className="text-aksen-secondary font-bold cursor-pointer hover:underline">Contact Sales</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
