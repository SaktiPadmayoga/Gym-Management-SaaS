// components/Header.tsx
"use client";

import { useTenant } from "@/hooks/useTenant";
import React from "react";

interface HeaderProps {
    isOpen: boolean;
    pathname: string;
}

const Header: React.FC<HeaderProps> = ({ isOpen, pathname }) => {
    const getPageTitle = () => {
        const page = pathname.split("/")[2] || "Dashboard";
        return page.charAt(0).toUpperCase() + page.slice(1);
    };

    const { tenant } = useTenant();

    return (
        <header className=" top-0 z-40 bg-white rounded-lg mx-4 mt-4 border border-gray-200 px-8 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-900">{tenant?.name || "ArcomGym"}</h1>
                    <div className="hidden md:block h-8 w-px bg-gray-200" />
                    <p className="hidden md:block text-gray-600 text-sm">{getPageTitle()}</p>
                </div>

                <div className="flex items-center gap-6">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Settings">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.5 21H5.625c-.621 0-1.125-.504-1.125-1.125V5.625c0-.621.504-1.125 1.125-1.125h12.75c.621 0 1.125.504 1.125 1.125v12.75m0 0H21m-3-9h3m-3 3h3"
                            />
                        </svg>
                    </button>

                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Preferences">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </button>

                    <div className="h-8 w-px bg-gray-200" />

                    <button className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow" title="User Profile">
                        A
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
