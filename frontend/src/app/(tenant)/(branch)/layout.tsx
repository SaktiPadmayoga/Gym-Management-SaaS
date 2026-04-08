"use client";

// app/(tenant)/(branch)/layout.tsx

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { ReactNode, useEffect } from "react";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { BranchProvider } from "@/providers/BranchProvider";
import { useRouter } from "next/navigation";

function StaffGuard({ children }: { children: ReactNode }) {
    const { staff, selectedBranch, isReady, isOwner } = useStaffAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isReady) return;
        if (!staff) {
            router.replace("/tenant-auth/login");
            return;
        }
        if (isOwner) {
            router.replace("/owner/dashboard");
            return;
        }
        if (!selectedBranch) {
            router.replace("/tenant-auth/select-branch");
            return;
        }
    }, [isReady, staff, selectedBranch, isOwner]);

    if (!isReady || !staff || isOwner || !selectedBranch) {
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
