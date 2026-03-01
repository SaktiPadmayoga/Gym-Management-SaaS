"use client";

import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { useCurrentSubscription, useSubscriptionHistory } from "@/hooks/useSubscriptionTenant";

/* =====================================
 * STATUS BADGE
 * ===================================== */
function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        active: "text-green-700 bg-green-100 border-green-200",
        trial: "text-blue-700 bg-blue-100 border-blue-200",
        cancelled: "text-red-700 bg-red-100 border-red-200",
        expired: "text-gray-700 bg-gray-100 border-gray-200",
    };
    return (
        <span className={`text-xs px-2 py-0.5 rounded-md border font-medium capitalize ${colors[status] ?? "text-gray-700 bg-gray-100"}`}>
            {status}
        </span>
    );
}

/* =====================================
 * FORMAT DATE
 * ===================================== */
function formatDate(date?: string | null) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
}

/* =====================================
 * FORMAT CURRENCY
 * ===================================== */
function formatPrice(price?: number | null) {
    if (!price) return "—";
    return new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", maximumFractionDigits: 0,
    }).format(price);
}

/* =====================================
 * MAIN PAGE
 * ===================================== */
export default function Subscription() {
    const router = useRouter();

    const { data: current, isLoading: currentLoading, isError: currentError } = useCurrentSubscription();
    const { data: history, isLoading: historyLoading } = useSubscriptionHistory();

    return (
        <div className="font-figtree">
            <Toaster position="top-center" />

            <div className="rounded-xl bg-white border border-gray-500/20 px-6 py-4">
                {/* Breadcrumb */}
                <div className="breadcrumbs text-sm text-zinc-400 mb-4">
                    <ul>
                        <li>Management</li>
                        <li className="text-aksen-secondary">Subscription</li>
                    </ul>
                </div>

                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-800">Subscription</h1>
                        <p className="text-zinc-500">Your current plan and billing information</p>
                    </div>
                    
                    <button
                        className="bg-aksen-secondary text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:opacity-90 transition"
                        onClick={() => router.push("/owner/subscription/plans")}
                    >
                        Upgrade Plan
                    </button>
                </div>

                <hr className="border-zinc-100 mb-6" />

                {/* Current Subscription */}
                {currentLoading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : currentError || !current ? (
                    <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-6 text-center text-zinc-400">
                        No active subscription found.
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-4 mb-8">
                        {/* Plan Card */}
                        <div className="col-span-12">
                            <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                                            Current Plan
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-bold text-zinc-800">{current.plan_name}</span>
                                            <StatusBadge status={current.status} />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-zinc-800">
                                            {current.billing_cycle === "yearly"
                                                ? formatPrice(current.price_yearly)
                                                : formatPrice(current.price_monthly)}
                                        </div>
                                        <div className="text-xs text-zinc-400 capitalize">
                                            per {current.billing_cycle ?? "month"}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    <div className="bg-white rounded-lg border border-zinc-100 px-4 py-3">
                                        <div className="text-xs text-zinc-400 mb-1">Billing Cycle</div>
                                        <div className="text-sm font-medium text-zinc-800 capitalize">
                                            {current.billing_cycle ?? "—"}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg border border-zinc-100 px-4 py-3">
                                        <div className="text-xs text-zinc-400 mb-1">Started</div>
                                        <div className="text-sm font-medium text-zinc-800">
                                            {formatDate(current.started_at)}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg border border-zinc-100 px-4 py-3">
                                        <div className="text-xs text-zinc-400 mb-1">Active Until</div>
                                        <div className="text-sm font-medium text-zinc-800">
                                            {formatDate(current.current_period_ends_at)}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg border border-zinc-100 px-4 py-3">
                                        <div className="text-xs text-zinc-400 mb-1">Max Branches</div>
                                        <div className="text-sm font-medium text-zinc-800">
                                            {current.max_branches ?? "Unlimited"}
                                        </div>
                                    </div>
                                </div>

                                {current.description && (
                                    <p className="text-sm text-zinc-400 mt-4">{current.description}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Subscription History */}
                <div>
                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
                        Subscription History
                    </h3>

                    {historyLoading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : !history || history.length === 0 ? (
                        <div className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-6 text-center text-zinc-400 text-sm">
                            No subscription history yet.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between bg-zinc-50/50 border border-zinc-100 rounded-xl px-5 py-4"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-zinc-800">{item.plan_name}</span>
                                            <StatusBadge status={item.status} />
                                        </div>
                                        <div className="text-xs text-zinc-400">
                                            {formatDate(item.started_at)} — {formatDate(item.current_period_ends_at)}
                                            {item.billing_cycle && (
                                                <span className="ml-2 capitalize">· {item.billing_cycle}</span>
                                            )}
                                        </div>
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