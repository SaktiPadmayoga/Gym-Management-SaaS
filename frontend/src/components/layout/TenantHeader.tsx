"use client";

import { useTenantHeader } from "@/hooks/useTenantHeader";
import { useState, useRef, useEffect } from "react";
import { BranchData } from "@/types/tenant/tenant";

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        active:    "bg-green-100 text-green-700",
        trial:     "bg-blue-100 text-blue-700",
        suspended: "bg-red-100 text-red-700",
        expired:   "bg-zinc-100 text-zinc-600",
    };
    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${map[status] ?? "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    );
}

function BranchSwitcher({
    branches,
    currentBranch,
    onSwitch,
}: {
    branches: BranchData[];
    currentBranch: BranchData | null;
    onSwitch: (id: string) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!branches || branches.length === 0) return null;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition text-sm text-zinc-700 font-medium"
            >
                {/* Branch icon */}
                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>

                <span className="max-w-[120px] truncate">
                    {currentBranch?.name ?? "Select Branch"}
                </span>

                {currentBranch?.is_main && (
                    <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded font-medium">
                        Main
                    </span>
                )}

                {/* Chevron */}
                <svg className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 mt-1 w-52 bg-white border border-zinc-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="px-3 py-2 text-xs text-zinc-400 font-medium border-b border-zinc-100">
                        Switch Branch
                    </div>
                    {branches.map((branch) => (
                        <button
                            key={branch.id}
                            onClick={() => {
                                onSwitch(branch.id);
                                setOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-zinc-50 transition ${
                                currentBranch?.id === branch.id
                                    ? "text-aksen-secondary font-semibold"
                                    : "text-zinc-700"
                            }`}
                        >
                            <span className="truncate">{branch.name}</span>
                            <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                {branch.is_main && (
                                    <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">
                                        Main
                                    </span>
                                )}
                                {currentBranch?.id === branch.id && (
                                    <svg className="w-3.5 h-3.5 text-aksen-secondary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function TenantHeader() {
    const { data, isLoading, switchBranch } = useTenantHeader();

    if (isLoading) {
        return (
            <div className="h-14 bg-white border-b border-zinc-200 flex items-center px-6 gap-4">
                <div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
            </div>
        );
    }

    if (!data) return null;

    const daysLeft = data.subscription_ends_at
        ? Math.ceil((new Date(data.subscription_ends_at).getTime() - Date.now()) / 86400000)
        : null;

    return (
        <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-6 font-figtree">
            {/* Left — Tenant identity */}
            <div className="flex items-center gap-3">
                {data.logo_url ? (
                    <img
                        src={data.logo_url}
                        alt={data.name}
                        className="w-7 h-7 rounded-lg object-cover"
                    />
                ) : (
                    <div className="w-7 h-7 rounded-lg bg-aksen-secondary/10 flex items-center justify-center text-aksen-secondary font-bold text-sm">
                        {data.name.charAt(0).toUpperCase()}
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-800 leading-tight">
                            {data.name}
                        </span>
                        <StatusBadge status={data.status} />
                    </div>
                    {data.subscription && (
                        <div className="text-xs text-zinc-400 leading-tight mt-0.5">
                            {data.subscription.plan_name}
                            {" · "}
                            <span className="capitalize">{data.subscription.billing_cycle}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right — Branch switcher + subscription info */}
            <div className="flex items-center gap-3">
                {/* Subscription expiry warning */}
                {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                    <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-lg font-medium">
                        Expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                    </div>
                )}

                {daysLeft !== null && daysLeft <= 0 && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg font-medium">
                        Subscription expired
                    </div>
                )}

                {/* Branch switcher */}
                <BranchSwitcher
                    branches={data.branches ?? []}
                    currentBranch={data.current_branch ?? null}
                    onSwitch={switchBranch}
                />
            </div>
        </header>
    );
}