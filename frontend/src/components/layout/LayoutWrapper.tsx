// components/LayoutWrapper.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { GripVertical } from "lucide-react";
import TenantHeader from "./TenantHeader";
import { useTenantHeader } from "@/hooks/useTenantHeader";
import { AlertTriangle } from "lucide-react";
import dayjs from "dayjs";

interface LayoutWrapperProps {
    children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsOpen(window.innerWidth >= 768);
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

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
        );
    }

    return (
        <div className="">
            <div className="flex flex-col h-full bg-zinc-100 py-4">
                {/* Header - akan fetch tenant sendiri */}
                <TenantHeader />

                {/* Main Container */}
                <div className="flex flex-1 overflow-visible h-full relative">
                    
                    {/* --- EXPIRED BLOCKING OVERLAY FOR STAFF --- */}
                    {isExpired && (
                        <div className="absolute inset-0 z-50 bg-zinc-100/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 rounded-tl-2xl border-t border-l border-white/50">
                            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-zinc-200 animate-in fade-in zoom-in-95 duration-300">
                                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertTriangle size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900 mb-2">Layanan Nonaktif</h2>
                                <p className="text-zinc-600 mb-2 leading-relaxed">
                                    Layanan aplikasi untuk gym ini sedang dinonaktifkan sementara.
                                </p>
                                <p className="text-sm text-zinc-500 font-medium">
                                    Silakan hubungi Owner atau Administrator gym Anda.
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="relative mb-4">
                        <Sidebar isOpen={isOpen} pathname={pathname} />

                        {/* Toggle Button */}
                        <button onClick={toggleSidebar} title={isOpen ? "Collapse sidebar" : "Expand sidebar"} className="absolute top-9 right-1 z-30 flex items-center justify-center">
                            {isOpen ? (
                                <div className="rounded-md transition-all duration-200 w-6 h-8 flex items-center justify-center mr-5 hover:cursor-pointer">
                                    <GripVertical className="h-6 w-6 hover:text-gray-500 text-gray-400" />
                                </div>
                            ) : (
                                <div className="rounded-md bg-white border border-gray-200 shadow hover:bg-gray-100 transition-all duration-200 py-0.5 hover:cursor-pointer">
                                    <GripVertical className="h-6 w-6 hover:text-gray-500 text-gray-400" />
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

export default LayoutWrapper;
