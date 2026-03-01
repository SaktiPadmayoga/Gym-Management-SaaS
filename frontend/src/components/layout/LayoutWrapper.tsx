// components/LayoutWrapper.tsx
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { GripVertical } from "lucide-react";
import TenantHeader from "./TenantHeader";

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

    if (!mounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white">
            <div className="flex flex-col h-full bg-zinc-100">
                {/* Header - akan fetch tenant sendiri */}
                <TenantHeader isOpen={isOpen} />

                {/* Main Container */}
                <div className="flex flex-1 overflow-visible">
                    <div className="relative">
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
