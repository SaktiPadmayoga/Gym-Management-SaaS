// components/TenantHeader.tsx

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTenantHeader } from "@/hooks/useTenantHeader";

interface TenantHeaderProps {
    isOpen?: boolean;
}

const TenantHeader: React.FC<TenantHeaderProps> = ({ isOpen }) => {
    const pathname = usePathname();
    const { data: tenant, isLoading, isError, error } = useTenantHeader();

    const getPageTitle = () => {
        const page = pathname.split("/")[1] || "Dashboard";
        return page.charAt(0).toUpperCase() + page.slice(1);
    };

    // Loading state
    if (isLoading) {
        return (
            <header className={`mx-4 mt-4 px-8 py-4 bg-white border rounded-lg transition-all ${isOpen ? "ml-64" : "ml-20"}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </header>
        );
    }

    // Error state
    if (isError) {
        console.error("Tenant header error:", error);
        return (
            <header className={`mx-4 mt-4 px-8 py-4 bg-red-50 border border-red-200 rounded-lg transition-all ${isOpen ? "ml-64" : "ml-20"}`}>
                <div className="flex items-center justify-between">
                    <div className="text-red-600">
                        <p className="font-semibold">Error loading tenant</p>
                        <p className="text-sm">{error instanceof Error ? error.message : "Unknown error"}</p>
                    </div>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Reload
                    </button>
                </div>
            </header>
        );
    }

    // No tenant data
    if (!tenant) {
        return (
            <header className={`mx-4 mt-4 px-8 py-4 bg-yellow-50 border border-yellow-200 rounded-lg transition-all ${isOpen ? "ml-64" : "ml-20"}`}>
                <div className="text-yellow-800">Tenant not found</div>
            </header>
        );
    }

    const subscription = tenant.latestSubscription;
    const showUpgradeCTA = !subscription || ["trial", "expired", "cancelled"].includes(subscription?.status);

    return (
        <header className={`top-0 z-40 bg-white rounded-lg mx-4 mt-4 border border-gray-200 px-8 py-4 transition-all `}>
            <div className="flex items-center justify-between">
                {/* LEFT */}
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{tenant.name || "Unknown Tenant"}</h1>

                    <div className="hidden md:block h-8 w-px bg-gray-200" />
                    <p className="hidden md:block text-gray-600 text-sm">{getPageTitle()}</p>

                    {subscription && (
                        <span className={`ml-3 px-3 py-1 rounded-full text-xs font-semibold ${subscription.status === "active" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{subscription.status.toUpperCase()}</span>
                    )}
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-4">
                    {showUpgradeCTA && (
                        <Link href="/billing/upgrade" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold transition">
                            Upgrade Subscription 🚀
                        </Link>
                    )}

                    <div className="h-8 w-px bg-gray-200" />

                    <button className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold">{(tenant.name || "?").charAt(0).toUpperCase()}</button>
                </div>
            </div>
        </header>
    );
};

export default TenantHeader;
