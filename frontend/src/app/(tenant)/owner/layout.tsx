"use client";

// app/(tenant)/owner/layout.tsx

import OwnerLayoutWrapper from "@/components/layout/OwnerLayoutWrapper";
import { ReactNode, useEffect } from "react";
import { useStaffAuth } from "@/providers/StaffAuthProvider";
import { BranchProvider } from "@/providers/BranchProvider";
import { Toaster } from "sonner";
import { useRouter } from "next/navigation";

function OwnerGuard({ children }: { children: ReactNode }) {
    const { staff, isReady, isOwner, loginDomain } = useStaffAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isReady) return;

        // Belum login
        if (!staff) {
            router.replace("/tenant-auth/login");
            return;
        }

        // Bukan owner
        if (!isOwner) {
            router.replace("/dashboard");
            return;
        }

        // Owner tapi login dari branch domain → ke branch dashboard
        if (loginDomain === "branch") {
            router.replace("/dashboard");
            return;
        }
    }, [isReady, staff, isOwner, loginDomain]);

    if (!isReady || !staff || !isOwner || loginDomain === "branch") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aksen-secondary" />
            </div>
        );
    }

    return <>{children}</>;
}

export default function OwnerLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <Toaster />
            <BranchProvider>
                <OwnerGuard>
                    <OwnerLayoutWrapper>{children}</OwnerLayoutWrapper>
                </OwnerGuard>
            </BranchProvider>
        </>
    );
}
