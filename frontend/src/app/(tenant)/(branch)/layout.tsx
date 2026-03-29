"use client";

// app/(tenant)/(branch)/layout.tsx

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { ReactNode, useEffect } from "react";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { BranchProvider } from "@/providers/BranchProvider";
import { useRouter } from "next/navigation";

function StaffGuard({ children }: { children: ReactNode }) {
    const { staff, selectedBranch, isReady, isOwner, loginDomain } = useStaffAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isReady) return;

        // Belum login → ke login page
        if (!staff) {
            router.replace("/tenant-auth/login");
            return;
        }

        // Belum ada branch terpilih → kembali ke login
        // (tidak ada select-branch page lagi)
        if (!selectedBranch) {
            router.replace("/tenant-auth/login");
            return;
        }

        // Owner dari tenant domain → ke owner dashboard
        if (isOwner && loginDomain === "tenant") {
            router.replace("/owner/dashboard");
            return;
        }
    }, [isReady, staff, selectedBranch, isOwner, loginDomain]);

    if (!isReady || !staff || !selectedBranch || (isOwner && loginDomain === "tenant")) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aksen-secondary" />
            </div>
        );
    }

    return <>{children}</>;
}

export default function BranchLayout({ children }: { children: ReactNode }) {
    return (
        <BranchProvider>
            <StaffGuard>
                <LayoutWrapper>{children}</LayoutWrapper>
            </StaffGuard>
        </BranchProvider>
    );
}
