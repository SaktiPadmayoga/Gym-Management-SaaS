"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTenantHeader } from "@/hooks/useTenantHeader";
import { usePublicBranchSettings } from "@/hooks/tenant/useBranchSettings";
import { useTenantBranch } from "@/hooks/useTenantBranches";
import { useBranch } from "@/providers/BranchProvider";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { useRouter } from "next/navigation";
import { Bell, Settings, User, LogOut, AlertTriangle, Menu, LayoutDashboard, Calendar, Clock, Users } from "lucide-react"; // Tambahkan User, LogOut, Menu, & Icons
import TenantNotificationBell from "../pages/tenant/transaction/notification/TenantNotification";
import dayjs from "dayjs";

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        active: "bg-green-100 text-green-700 border-green-200",
        trial: "bg-blue-100 text-blue-700 border-blue-200",
        suspended: "bg-red-100 text-red-700 border-red-200",
        expired: "bg-zinc-100 text-zinc-600 border-zinc-200",
    };

    return <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest border ${map[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>{status}</span>;
}

export default function TenantHeader() {
    const router = useRouter();
    const { data, isLoading } = useTenantHeader();
    const { branchId } = useBranch();

    const { data: branch } = useTenantBranch(branchId ?? undefined);
    const { data: publicSettings } = usePublicBranchSettings(branchId ?? undefined);

    // ✅ Ambil data staff dan fungsi logout dari provider
    const { staff, logout, selectedBranch } = useStaffAuth();

    const isOwner = staff?.role === "owner";
    const isTrainer = selectedBranch?.role === "trainer";

    // --- DROPDOWN STATE & LOGIC ---
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hamburgerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                (!hamburgerRef.current || !hamburgerRef.current.contains(event.target as Node))
            ) {
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

    // Logo: branch settings → fallback ke logo tenant (inherit)
    const logoUrl = publicSettings?.logo_url || data?.logo_url || "/images/logobaru.png";

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
                <div
                    className={`mx-4 mb-3 px-4 py-2.5 rounded-lg border flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 ${
                        isExpired ? "bg-red-50 border-red-200 text-red-800" : "bg-orange-50 border-orange-200 text-orange-800"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={18} className={isExpired ? "text-red-600" : "text-orange-600"} />
                        <div className="text-sm font-medium">
                            {isExpired ? (
                                <span>
                                    Subscription Anda telah <strong className="font-bold">kedaluwarsa</strong>. Akses aplikasi dibatasi.
                                </span>
                            ) : (
                                <span>
                                    Subscription Anda akan kedaluwarsa dalam <strong className="font-bold">{daysLeft} hari</strong>.
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/owner/subscription")}
                        className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors ${isExpired ? "bg-red-600 hover:bg-red-700 text-white" : "bg-orange-600 hover:bg-orange-700 text-white"}`}
                    >
                        Perbarui Sekarang
                    </button>
                </div>
            )}

            <header className="h-16 mx-4 rounded-lg border border-zinc-200 bg-white flex items-center justify-between px-5 font-sans relative z-40">
                {/* --- LEFT: GYM BRANDING & INFO --- */}
                <div className="flex items-center gap-3.5">
                    <button
                        ref={hamburgerRef}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="p-2 -ml-2 rounded-xl md:hidden hover:bg-zinc-100 transition-colors focus:outline-none text-zinc-700"
                        title="Toggle menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {logoUrl ? (
                        <img src={logoUrl} alt={data.name} className="w-10 h-10 rounded-xl object-cover bg-white p-0.5 shadow-sm" />
                    ) : (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-zinc-200 bg-zinc-50 text-zinc-700">
                            {data.name.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div className="flex flex-col justify-center">
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-black tracking-tight leading-none text-zinc-900">
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
                        <div className="hidden sm:flex items-center px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-zinc-200 bg-zinc-50 text-zinc-600">
                            Owner View
                        </div>
                    )}

                    <TenantNotificationBell />

                    <div className="h-6 w-px bg-zinc-200" />

                    {/* WRAPPER DROPDOWN PROFILE */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 text-left group focus:outline-none rounded-xl p-1 -mr-1 transition-all hover:cursor-pointer hover:bg-zinc-100"
                        >
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-bold leading-none truncate max-w-[120px] text-zinc-900">
                                    {staff?.name || "Staff"}
                                </span>
                                <span className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-zinc-500">
                                    {staff?.role || "Staff"}
                                </span>
                            </div>
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border border-zinc-200 bg-zinc-100 text-zinc-700 transition-transform group-hover:scale-105">
                                {staff?.name?.charAt(0).toUpperCase() || "S"}
                            </div>
                        </button>

                        {/* ISI DROPDOWN */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-60 bg-white border border-zinc-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-2 border-b border-zinc-100 mb-1">
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Login sebagai</p>
                                    <p className="text-xs font-semibold text-zinc-900 truncate">{staff?.email || "staff@gym.com"}</p>
                                </div>

                                {/* Mobile Navigation Menu for Trainer */}
                                {isTrainer && (
                                    <div className="block md:hidden border-b border-zinc-100 pb-1 mb-1 px-1">
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider px-3 py-1.5">Menu Pelatih</p>
                                        
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                router.push("/dashboard/trainer");
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-teal-600 rounded-lg transition-colors flex items-center gap-2.5 font-medium"
                                        >
                                            <LayoutDashboard size={18} className="text-zinc-400" />
                                            Dashboard
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                router.push("/pt-sessions");
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-teal-600 rounded-lg transition-colors flex items-center gap-2.5 font-medium"
                                        >
                                            <Calendar size={18} className="text-zinc-400" />
                                            Jadwal Saya
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                router.push("/pt-sessions/requests");
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-teal-600 rounded-lg transition-colors flex items-center gap-2.5 font-medium"
                                        >
                                            <Clock size={18} className="text-zinc-400" />
                                            Request Sesi
                                        </button>

                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                router.push("/trainer/members");
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-teal-600 rounded-lg transition-colors flex items-center gap-2.5 font-medium"
                                        >
                                            <Users size={18} className="text-zinc-400" />
                                            Member Saya
                                        </button>
                                    </div>
                                )}

                                <div className="px-1">
                                    {/* Menu Profile */}
                                    {isOwner ? (
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                router.push("/owner/profile");
                                            }}
                                            className="w-full text-left px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-teal-600 rounded-lg transition-colors flex items-center gap-2.5 font-medium"
                                        >
                                            <User size={18} className="text-zinc-400" />
                                            Profile Owner
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setIsDropdownOpen(false);
                                                router.push("/profile");
                                            }}
                                            className="w-full text-left px-3 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-teal-600 rounded-lg transition-colors flex items-center gap-2.5 font-medium"
                                        >
                                            <User size={18} className="text-zinc-400" />
                                            {isTrainer ? "Profile Trainer" : "Profile Staff"}
                                        </button>
                                    )}

                                    {/* Menu Logout untuk semua role */}
                                    <button onClick={handleLogout} className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2.5 font-medium mt-0.5">
                                        <LogOut size={18} className="text-red-400" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* AKHIR WRAPPER DROPDOWN */}
                </div>
            </header>
        </div>
    );
}
