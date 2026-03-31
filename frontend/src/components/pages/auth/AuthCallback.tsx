"use client";

// app/(tenant)/tenant-auth/callback/page.tsx

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginBranchData } from "@/types/tenant/staff-auth";
import type { StaffData } from "@/types/tenant/staffs";

const TOKEN_KEY = "staff_token";
const DATA_KEY = "staff_data";
const BRANCH_KEY = "staff_branches";
const ROLE_KEY = "staff_global_role";
const SELECTED_KEY = "staff_selected_branch";

export default function AuthCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const error = searchParams.get("error");
        const token = searchParams.get("token");
        const staffRaw = searchParams.get("staff");
        const branchesRaw = searchParams.get("branches");
        const globalRole = searchParams.get("global_role");

        if (error) {
            const messages: Record<string, string> = {
                google_failed: "Google login failed. Please try again.",
                inactive: "Your account has been deactivated.",
                tenant_not_found: "Tenant not found.",
            };
            alert(messages[error] ?? "Login failed");
            router.replace("/tenant-auth/login");
            return;
        }

        if (!token || !staffRaw || !branchesRaw) {
            router.replace("/tenant-auth/login");
            return;
        }

        try {
            const staffData: StaffData = JSON.parse(decodeURIComponent(staffRaw));
            const branches: LoginBranchData[] = JSON.parse(decodeURIComponent(branchesRaw));
            const role = decodeURIComponent(globalRole ?? "staff");

            // Simpan ke localStorage + cookie
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(DATA_KEY, JSON.stringify(staffData));
            localStorage.setItem(BRANCH_KEY, JSON.stringify(branches));
            localStorage.setItem(ROLE_KEY, role);
            document.cookie = `staff_token=${token}; path=/; max-age=${60 * 60 * 8}`;

            // Owner → langsung owner dashboard
            if (role === "owner") {
                router.replace("/owner/dashboard");
                return;
            }

            // Staff dengan 1 branch → auto-select
            if (branches.length === 1) {
                localStorage.setItem(SELECTED_KEY, JSON.stringify(branches[0]));
                localStorage.setItem(
                    "current_branch",
                    JSON.stringify({
                        id: branches[0].id,
                        name: branches[0].name,
                        address: branches[0].address ?? null,
                    }),
                );
                router.replace("/dashboard");
                return;
            }

            // Staff dengan banyak branch → pilih dulu
            if (branches.length > 1) {
                router.replace("/tenant-auth/select-branch");
                return;
            }

            // Tidak ada branch
            router.replace("/tenant-auth/login");
        } catch {
            router.replace("/tenant-auth/login");
        }
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-figtree">
            <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-aksen-secondary mx-auto mb-4" />
                <p className="text-zinc-500 text-sm">Completing sign in...</p>
            </div>
        </div>
    );
}
