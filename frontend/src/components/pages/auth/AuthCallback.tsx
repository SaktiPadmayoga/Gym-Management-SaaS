"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LoginBranchData } from "@/types/tenant/staff-auth";

interface StaffData {
    [key: string]: unknown;
}

function detectDomain(): "tenant" | "branch" {
    if (typeof window === "undefined") return "tenant";
    const parts = window.location.hostname.split(".");
    return parts.length >= 3 ? "branch" : "tenant";
}

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
            const currentDomain = detectDomain();
            const currentSubdomain = window.location.hostname.split(".")[0];

            // Simpan token & data ke localStorage + cookie
            localStorage.setItem("staff_token", token);
            localStorage.setItem("staff_data", JSON.stringify(staffData));
            localStorage.setItem("staff_branches", JSON.stringify(branches));
            localStorage.setItem("staff_global_role", role);
            localStorage.setItem("staff_login_domain", currentDomain);
            document.cookie = `staff_token=${token}; path=/; max-age=${60 * 60 * 8}`;

            // Owner dari tenant domain → langsung owner dashboard tanpa pilih branch
            if (role === "owner" && currentDomain === "tenant") {
                router.replace("/owner/dashboard");
                return;
            }

            if (currentDomain === "branch") {
                const matchedBranch = branches.find((b) => b.branch_code?.toLowerCase() === currentSubdomain.toLowerCase());

                if (matchedBranch) {
                    // auto select
                    localStorage.setItem(`staff_selected_branch_${currentSubdomain}`, JSON.stringify(matchedBranch));
                    localStorage.setItem(`current_branch_${currentSubdomain}`, JSON.stringify(matchedBranch));
                    router.replace("/dashboard");
                    return;
                }

                // ← PERUBAHAN UTAMA
                alert(`Anda tidak memiliki akses ke cabang "${currentSubdomain}".\n\nSilakan login melalui subdomain cabang yang sesuai.`);
                router.replace("/tenant-auth/login");
                return;
            }

            // Tidak ada branch yang match → kembali ke login
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
