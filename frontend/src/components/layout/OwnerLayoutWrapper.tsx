// components/LayoutWrapper.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import { GripVertical } from "lucide-react";
import OwnerSidebar from "./OwnerSidebar";
import TenantHeader from "./TenantHeader";
import { useTenantHeader } from "@/hooks/useTenantHeader";
import { AlertCircle, ArrowRight } from "lucide-react";
import dayjs from "dayjs";
import Link from "next/link";

interface OwnerLayoutWrapperProps {
    children: React.ReactNode;
}

const OwnerLayoutWrapper: React.FC<OwnerLayoutWrapperProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    // Handle mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle responsive behavior
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsOpen(false);
            } else {
                setIsOpen(true);
            }
        };

        if (mounted) {
            handleResize();
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, [mounted]);

    const toggleSidebar = () => setIsOpen((prev) => !prev);

    const { data: tenantData } = useTenantHeader();

    let isExpired = false;
    if (tenantData?.status === 'expired' || tenantData?.status === 'suspended') {
        isExpired = true;
    } else if (tenantData?.subscription_ends_at) {
        const endDate = dayjs(tenantData.subscription_ends_at);
        if (endDate.diff(dayjs(), "day") < 0) {
            isExpired = true;
        }
    }

    // Allow access to these routes even if expired
    const isBillingRoute = pathname.startsWith("/owner/subscription") || pathname.startsWith("/owner/plans");

    // Show loading state while mounting
    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center my-4">
                <div className="h-16 mx-4 rounded-lg border flex items-center justify-between px-5 font-sans bg-zinc-400 animate-ping">
                </div>
                <div className="flex">
                    <div className="h-full w-1/5 mx-4 rounded-lg border flex items-center justify-between px-5 font-sans bg-zinc-400 animate-ping"></div>
                    <div className="h-full w-4/5 mx-4 rounded-lg border flex items-center justify-between px-5 font-sans bg-zinc-400 animate-ping"></div>
                </div>

            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="flex flex-col min-h-screen h-full bg-zinc-100 pt-4 ">
                {/* Header */}

                <TenantHeader/>

                {/* Main Container */}
                <div className="flex flex-1 overflow-visible relative">
                    
                    {/* --- EXPIRED BLOCKING OVERLAY --- */}
                    {isExpired && !isBillingRoute && (
                        <div className="absolute inset-0 z-50 bg-zinc-100/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 rounded-tl-2xl border-t border-l border-white/50">
                            <div className="md:-mt-90 bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-zinc-200 animate-in fade-in zoom-in-95 duration-300">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900 mb-2">Subscription Habis</h2>
                                <p className="text-zinc-600 mb-8 leading-relaxed">
                                    Layanan aplikasi saat ini dibatasi karena masa aktif subscription Anda telah berakhir. Silakan perbarui layanan untuk kembali mengakses seluruh fitur.
                                </p>
                                <Link 
                                    href="/owner/subscription"
                                    className="inline-flex items-center justify-center gap-2 w-full bg-aksen-secondary hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-sm shadow-teal-700/20"
                                >
                                    Perbarui Subscription
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    )}
                    <div className="relative ">
                        {/* SIDEBAR */}
                        <OwnerSidebar isOpen={isOpen} pathname={pathname} />

                        {/* TOGGLE FLOATING */}
                        <button
                            onClick={toggleSidebar}
                            title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
                            className="
                                absolute
                                top-9
                                right-1
                                z-30
                                flex
                                items-center
                                justify-center
                                
                            "
                        >
                            {isOpen ? (
                                <div
                                    className="
                                
                                rounded-md
                                
                                transition-all
                                duration-200 
                                 w-6 h-8 flex items-center justify-center mr-5 hover:cursor-pointer "
                                >
                                    <GripVertical className="h-6 w-6 hover:text-gray-500  text-gray-400" />
                                </div>
                            ) : (
                                <div
                                    className="rounded-md
                                bg-white
                                border
                                border-gray-200
                                shadow
                                hover:bg-gray-100
                                transition-all
                                duration-200 py-0.5 hover:cursor-pointer"
                                >
                                    <GripVertical className="h-6 w-6 hover:text-gray-500  text-gray-400" />
                                </div>
                            )}
                        </button>
                    </div>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto pr-4 py-4">
                        <div className="w-full mx-auto">{children}</div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default OwnerLayoutWrapper;
