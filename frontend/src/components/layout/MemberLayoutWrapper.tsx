// components/LayoutWrapper.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import MemberSidebar from "./MemberSidebar";
import MemberHeader from "./MemberHeader";
import { useTenantHeader } from "@/hooks/useTenantHeader";
import { AlertTriangle } from "lucide-react";
import dayjs from "dayjs";

interface MemberLayoutWrapperProps {
    children: React.ReactNode;
}

const MemberLayoutWrapper: React.FC<MemberLayoutWrapperProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    // Handle mounting
    useEffect(() => {
        setMounted(true);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileSidebarOpen(false);
    }, [pathname]);

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

    // Show loading state while mounting
    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="flex flex-col min-h-screen bg-zinc-100 py-4">
                {/* Header */}

                <MemberHeader onMenuClick={() => setIsMobileSidebarOpen(true)} />

                {/* Main Container */}
                <div className="flex flex-1 overflow-visible relative">
                    
                    {/* --- EXPIRED BLOCKING OVERLAY FOR MEMBER --- */}
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
                                    Silakan hubungi staf atau pengelola gym Anda untuk informasi lebih lanjut.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* SIDEBAR */}
                    <MemberSidebar 
                        isOpen={isOpen} 
                        onToggle={toggleSidebar}
                        pathname={pathname} 
                        isMobileOpen={isMobileSidebarOpen}
                        onMobileClose={() => setIsMobileSidebarOpen(false)}
                    />

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto px-4 md:pl-0 md:pr-4 py-4">
                        <div className="w-full mx-auto">{children}</div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default MemberLayoutWrapper;
