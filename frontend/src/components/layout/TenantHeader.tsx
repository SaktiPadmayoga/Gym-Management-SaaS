"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTenantHeader } from "@/hooks/useTenantHeader";
import { usePublicBranchSettings } from "@/hooks/tenant/useBranchSettings";
import { useTenantBranch } from "@/hooks/useTenantBranches";
import { useBranch } from "@/providers/BranchProvider";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { useRouter } from "next/navigation";
import { Bell, Settings, User, LogOut } from "lucide-react"; // Tambahkan User & LogOut
import TenantNotificationBell from "../pages/tenant/transaction/notification/TenantNotification";
import dayjs from "dayjs";
import { AlertTriangle } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        active: "bg-green-100 text-green-700 border-green-200",
        trial: "bg-blue-100 text-blue-700 border-blue-200",
        suspended: "bg-red-100 text-red-700 border-red-200",
        expired: "bg-zinc-100 text-zinc-600 border-zinc-200",
    };

    return (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${map[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
            {status}
        </span>
    );
}

function isColorDark(hex: string): boolean {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
}

export default function TenantHeader() {
    const router = useRouter();
    const { data, isLoading } = useTenantHeader();
    const { branchId } = useBranch();

    const { data: branch } = useTenantBranch(branchId ?? undefined);
    const { data: publicSettings } = usePublicBranchSettings(branchId ?? undefined);

    // ✅ Ambil data staff dan fungsi logout dari provider
    const { staff, logout } = useStaffAuth();
    
    const isOwner = staff?.role === "owner"; 

    // --- DROPDOWN STATE & LOGIC ---
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const handleLogout = async () => {
        try {
            await logout();
            // Router redirect opsional jika tidak di-handle oleh provider
            // router.push('/tenant-auth/login');
        } catch (error) {
            console.error("Logout gagal:", error);
        }
    };
    // ------------------------------

    const primaryColor = publicSettings?.primary_color ?? "#ffffff";
    const logoUrl = publicSettings?.logo_url ?? null;

    const isDark = isColorDark(primaryColor);
    const textColor = isDark ? "#ffffff" : "#18181b";
    const subTextColor = isDark ? "rgba(255,255,255,0.7)" : "rgba(24,24,27,0.6)";
    const borderColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)";

    if (isLoading) {
        return (
            <div className="h-16 mx-4 bg-white border border-zinc-200 rounded-lg flex items-center px-6 gap-4">
                <div className="h-10 w-10 bg-zinc-100 rounded-xl animate-pulse" />
                <div className="flex flex-col gap-2">
                    <div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (!data) return null;

    // Calculate days left
    let daysLeft = null;
    let isWarning = false;
    let isExpired = false;

    if (data.subscription_ends_at) {
        const endDate = dayjs(data.subscription_ends_at);
        daysLeft = endDate.diff(dayjs(), "day");
        
        if (daysLeft < 0) {
            isExpired = true;
        } else if (daysLeft <= 7) {
            isWarning = true;
        }
    }

    return (
        <div className="flex flex-col relative z-40">
            {/* --- WARNING BANNER --- */}
            {(isWarning || isExpired) && isOwner && (
                <div className={`mx-4 mb-3 px-4 py-2.5 rounded-lg border flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 ${
                    isExpired 
                        ? "bg-red-50 border-red-200 text-red-800" 
                        : "bg-orange-50 border-orange-200 text-orange-800"
                }`}>
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={18} className={isExpired ? "text-red-600" : "text-orange-600"} />
                        <div className="text-sm font-medium">
                            {isExpired ? (
                                <span>Subscription Anda telah <strong className="font-bold">kedaluwarsa</strong>. Akses aplikasi dibatasi.</span>
                            ) : (
                                <span>Subscription Anda akan kedaluwarsa dalam <strong className="font-bold">{daysLeft} hari</strong>.</span>
                            )}
                        </div>
                    </div>
                    <button 
                        onClick={() => router.push('/owner/subscription')}
                        className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${
                            isExpired 
                                ? "bg-red-600 hover:bg-red-700 text-white" 
                                : "bg-orange-600 hover:bg-orange-700 text-white"
                        }`}
                    >
                        Perbarui Sekarang
                    </button>
                </div>
            )}

        <header 
            className="h-16 mx-4 rounded-lg border flex items-center justify-between px-5 font-sans transition-all duration-300 relative z-40" 
            style={{ backgroundColor: primaryColor, borderColor }}
        >
            {/* --- LEFT: GYM BRANDING & INFO --- */}
            <div className="flex items-center gap-3.5">
                {logoUrl ? (
                    <img src={logoUrl} alt={data.name} className="w-10 h-10 rounded-xl object-cover bg-white p-0.5 shadow-sm" />
                ) : (
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border"
                        style={{
                            backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                            borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
                            color: textColor,
                        }}
                    >
                        {data.name.charAt(0).toUpperCase()}
                    </div>
                )}

                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-black tracking-tight leading-none" style={{ color: textColor }}>
                            {data.name}
                        </h1>
                        <StatusBadge status={data.status} />
                    </div>
                </div>
            </div>

            {/* --- RIGHT: ACTIONS & PROFILE --- */}
            <div className="flex items-center gap-4">
                
                {/* Indikator Owner */}
                {isOwner && (
                    <div 
                        className="hidden sm:flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border" 
                        style={{ 
                            backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.5)", 
                            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
                            color: textColor 
                        }}
                    >
                        Owner View
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <TenantNotificationBell/>

                    <button className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors" onClick={() => router.push('/settings')}>
                        <Settings className="w-5 h-5" />
                    </button>
                </div> 

                <div className="h-6 w-px" style={{ backgroundColor: borderColor }} /> 

                {/* WRAPPER DROPDOWN PROFILE */}
                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                        className="flex items-center gap-3 text-left group focus:outline-none rounded-xl p-1 -mr-1 transition-all hover:cursor-pointer hover:bg-white/10 dark:hover:bg-black/10"
                    >
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-sm font-bold leading-none truncate max-w-[120px]" style={{ color: textColor }}>
                                {staff?.name || "Staff"}
                            </span>
                            {/* Tambahan role text di bawah nama */}
                            <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5 opacity-80" style={{ color: textColor }}>
                                {staff?.role || "Staff"}
                            </span>
                        </div>
                        <div 
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border transition-transform group-hover:scale-105" 
                            style={{ 
                                backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.05)", 
                                borderColor: isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.1)",
                                color: textColor 
                            }}
                        >
                            {staff?.name?.charAt(0).toUpperCase() || "S"}
                        </div>
                    </button>

                    {/* ISI DROPDOWN */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            
                            <div className="px-4 py-2 border-b border-zinc-100 mb-1">
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Login sebagai</p>
                                <p className="text-xs font-semibold text-zinc-900 truncate">
                                    {staff?.email || "staff@gym.com"}
                                </p>
                            </div>
                            
                            {/* Menu Profile hanya untuk Owner */}
                            {isOwner ? (
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        router.push('/owner/profile');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-teal-600 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <User size={16} />
                                    Profile Owner
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(false);
                                        router.push('/profile');
                                    }}
                                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-teal-600 transition-colors flex items-center gap-2 font-medium"
                                >
                                    <User size={16} />
                                    Profile Staff
                                </button>
                            )}
                            
                            {/* Menu Logout untuk semua role */}
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
                {/* AKHIR WRAPPER DROPDOWN */}

            </div>
        </header>
        </div>
    );
}