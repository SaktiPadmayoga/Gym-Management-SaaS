"use client";

import { useTenantHeader } from "@/hooks/useTenantHeader";
import { usePublicBranchSettings } from "@/hooks/tenant/useBranchSettings";
import { useTenantBranch } from "@/hooks/useTenantBranches";
import { useBranch } from "@/providers/BranchProvider";
import { useStaffAuth } from "@/providers/StaffAuthProvider";

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        active: "bg-green-100 text-green-700",
        trial: "bg-blue-100 text-blue-700",
        suspended: "bg-red-100 text-red-700",
        expired: "bg-zinc-100 text-zinc-600",
    };

    return <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${map[status] ?? "bg-gray-100 text-gray-600"}`}>{status}</span>;
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
    const { data, isLoading } = useTenantHeader();
    const { branchId } = useBranch();

    // ✅ Ambil detail branch langsung
    const { data: branch } = useTenantBranch(branchId ?? undefined);

    // ✅ Ambil public settings branch
    const { data: publicSettings } = usePublicBranchSettings(branchId ?? undefined);

    // ✅ Ambil data staff yang sedang login
    const { staff } = useStaffAuth();
    
    // ✅ Cek apakah role staff adalah owner (sesuaikan key 'role' dengan response API/tipe data kamu)
    const isOwner = staff?.role === "owner"; 

    const primaryColor = publicSettings?.primary_color ?? "#ffffff";
    const logoUrl = publicSettings?.logo_url ?? null;

    const isDark = isColorDark(primaryColor);
    const textColor = isDark ? "#ffffff" : "#18181b";
    const subTextColor = isDark ? "rgba(255,255,255,0.65)" : "rgba(24,24,27,0.55)";

    if (isLoading) {
        return (
            <div className="h-14 bg-white border-b border-zinc-200 flex items-center px-6 gap-4">
                <div className="h-4 w-32 bg-zinc-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-zinc-100 rounded animate-pulse" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <header className="h-14 flex items-center justify-between px-6 font-figtree transition-colors duration-300" style={{ backgroundColor: primaryColor }}>
            {/* LEFT */}
            <div className="flex items-center gap-3">
                {logoUrl ? (
                    <img src={logoUrl} alt={data.name} className="w-7 h-7 rounded-lg object-cover" />
                ) : (
                    <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm"
                        style={{
                            backgroundColor: "rgba(255,255,255,0.15)",
                            color: textColor,
                        }}
                    >
                        {data.name.charAt(0).toUpperCase()}
                    </div>
                )}

                <div>
                    <div className="flex items-center gap-2">
                        {/* ✅ Nama tenant tetap */}
                        <span className="text-sm font-semibold" style={{ color: textColor }}>
                            {data.name}
                        </span>
                        <StatusBadge status={data.status} />
                    </div>

                    {/* ✅ Nama branch dari hook (Sembunyikan jika user adalah owner) */}
                    {branch && !isOwner && (
                        <div className="text-xs mt-0.5" style={{ color: subTextColor }}>
                            {branch.name}
                            {branch.is_active && " · Main Branch"}
                        </div>
                    )}

                    {/* Subscription */}
                    {data.subscription && (
                        <div className="text-xs" style={{ color: subTextColor }}>
                            {data.subscription.plan_name} · <span className="capitalize">{data.subscription.billing_cycle}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">
                {/* Bisa ditambahkan indikator "Owner View" di sini jika perlu */}
                {isOwner && (
                    <div className="text-xs font-medium px-2 py-1 rounded-md" style={{ backgroundColor: "rgba(255,255,255,0.15)", color: textColor }}>
                        Owner Dashboard
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold" style={{ color: textColor }}>
                        {staff?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium" style={{ color: textColor }}>
                        {staff?.name}
                    </span>
                </div>
            </div>
        </header>
    );
}