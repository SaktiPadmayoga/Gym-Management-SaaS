"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Settings, User, LogOut } from "lucide-react"; // Tambahkan icon User & LogOut
import { useRouter } from "next/navigation";

// Sesuaikan path import hook Anda:
import { useMyProfile } from "@/hooks/useAdmins"; 
import NotificationBell from "../pages/master/manage-tenant/notification/Notifications";

// TODO: Sesuaikan path ini dengan lokasi context/provider Auth milikmu!
import { useAdminAuth } from "@/providers/AdminAuthProvider"; 

interface HeaderProps {
    isOpen?: boolean;
    pathname: string;
}

const Header: React.FC<HeaderProps> = ({ pathname }) => {
    const router = useRouter();
    
    // Fetch data admin yang sedang login
    const { data: profile } = useMyProfile();
    
    // Ambil fungsi logout dari provider Auth
    const { logout } = useAdminAuth(); 

    // State & Ref untuk mengontrol Dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Efek untuk menutup dropdown jika user meng-klik di luar area dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const getPageTitle = () => {
        const pathSegments = pathname.split("/").filter(Boolean);
        const page = pathSegments[pathSegments.length - 1] || "Dashboard";
        return page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, " ");
    };

    // Ambil inisial dari nama, default ke "A" jika belum ter-load
    const initial = profile?.name?.charAt(0).toUpperCase() || "A";

    const handleLogout = async () => {
        try {
            await logout(); // Eksekusi fungsi logout dari provider
            // Jika provider tidak memiliki auto-redirect, buka komen di bawah ini:
            // router.push('/admin/login');
        } catch (error) {
            console.error("Logout gagal:", error);
        }
    };

    return (
        <header className="bg-white rounded-lg mx-4 mt-4 border border-zinc-200 px-6 py-2 z-40 relative">
            <div className="flex items-center justify-between">
                
                {/* --- KIRI: Konteks & Breadcrumbs --- */}
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-extrabold font-outfit text-zinc-900 tracking-tigh uppercase">GYMFIT.</h1>
                </div>

                {/* --- KANAN: Actions & User Profile --- */}
                <div className="flex items-center gap-4">
                    
                    <div className="flex items-center gap-2">
                        <NotificationBell />
                    </div>

                    <div className="h-6 w-px bg-zinc-200" />

                    {/* WRAPPER DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                        {/* Profile Button (Trigger) */}
                        <button 
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none hover:bg-zinc-100 p-1.5 rounded-lg"
                        >
                            <div className="w-8 h-8 bg-linear-to-br from-aksen-primary to-aksen-secondary rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-aksen-secondary/20">
                                {initial}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-bold text-zinc-900 leading-none truncate max-w-[100px]">
                                    {profile?.name || "Memuat..."}
                                </span>
                                <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest mt-0.5">
                                    {profile?.role || "Superuser"}
                                </span>
                            </div>
                        </button>

                        {/* ISI DROPDOWN */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                
                                <div className="px-4 py-2 border-b border-zinc-100 mb-1">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Login sebagai</p>
                                    <p className="text-xs font-semibold text-zinc-900 truncate">
                                        {profile?.email || "Admin"}
                                    </p>
                                </div>
                                
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        router.push('/admin/profile');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-teal-600 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <User size={16} />
                                    Profile Saya
                                </button>
                                
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium mt-1"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>

                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
};

export default Header;